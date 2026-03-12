"""
Email utility functions for reading emails via IMAP and Microsoft Graph API.
"""
import imaplib
import email
import requests
import logging
from email.header import decode_header
from email.utils import parseaddr, parsedate_to_datetime
from typing import List, Dict, Optional, Tuple
from django.conf import settings
from django.utils import timezone
import ssl

logger = logging.getLogger(__name__)


class OutlookEmailReader:
    """
    Class to read emails from Microsoft Outlook using Microsoft Graph API.
    Uses OAuth tokens stored in OutlookMailbox model.
    """
    GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'
    
    def __init__(self, mailbox):
        """
        Initialize with an OutlookMailbox instance.
        
        Args:
            mailbox: OutlookMailbox model instance
        """
        self.mailbox = mailbox
        self.access_token = None
    
    def _get_headers(self) -> Dict:
        """Get authorization headers for Graph API requests."""
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
        }
    
    def connect(self) -> bool:
        """
        Get a valid access token for the mailbox.
        Returns True if successful, False otherwise.
        """
        self.access_token = self.mailbox.get_valid_token()
        if not self.access_token:
            logger.error(f"Failed to get valid token for mailbox: {self.mailbox.email_address}")
            return False
        return True
    
    def disconnect(self):
        """Clear the access token."""
        self.access_token = None
    
    def list_folders(self) -> List[Dict]:
        """
        List all mail folders in the mailbox.
        
        Returns list of folder dicts with 'id', 'displayName', 'parentFolderId', etc.
        """
        if not self.access_token:
            return []
        
        try:
            url = f"{self.GRAPH_API_BASE}/me/mailFolders"
            response = requests.get(url, headers=self._get_headers())
            
            if not response.ok:
                logger.error(f"Failed to list folders: {response.text}")
                return []
            
            data = response.json()
            return data.get('value', [])
        except Exception as e:
            logger.error(f"Error listing folders: {e}")
            return []
    
    def get_folder_id(self, folder_name: str) -> Optional[str]:
        """
        Get the folder ID for a given folder name.
        
        Args:
            folder_name: Display name of the folder (e.g., 'Inbox')
        
        Returns folder ID or None if not found.
        """
        folders = self.list_folders()
        for folder in folders:
            if folder.get('displayName', '').lower() == folder_name.lower():
                return folder.get('id')
        return None
    
    def _parse_email(self, message_data: Dict) -> Dict:
        """
        Parse a Graph API message into a standardized email dictionary.
        
        Args:
            message_data: Message object from Graph API
        
        Returns parsed email dictionary.
        """
        # Get sender info
        from_data = message_data.get('from', {}).get('emailAddress', {})
        from_email = from_data.get('address', '').lower()
        from_name = from_data.get('name', '')
        
        # Get recipients
        to_addresses = []
        for recipient in message_data.get('toRecipients', []):
            addr = recipient.get('emailAddress', {}).get('address', '')
            if addr:
                to_addresses.append(addr.lower())
        
        # Get CC recipients
        cc_addresses = []
        for recipient in message_data.get('ccRecipients', []):
            addr = recipient.get('emailAddress', {}).get('address', '')
            if addr:
                cc_addresses.append(addr.lower())
        
        # Parse received date
        received_at = None
        received_str = message_data.get('receivedDateTime')
        if received_str:
            try:
                # Graph API returns ISO 8601 format
                from dateutil.parser import parse as parse_datetime
                received_at = parse_datetime(received_str)
            except Exception:
                pass
        
        # Get body content
        body_data = message_data.get('body', {})
        body_type = body_data.get('contentType', 'text')
        body_content = body_data.get('content', '')
        
        plain_body = ''
        html_body = ''
        if body_type.lower() == 'html':
            html_body = body_content
            # Extract plain text from HTML for display
            from html import unescape
            import re
            plain_body = re.sub(r'<[^>]+>', '', body_content)
            plain_body = unescape(plain_body).strip()
        else:
            plain_body = body_content
        
        # Get conversation threading info
        conversation_id = message_data.get('conversationId', '')
        internet_message_id = message_data.get('internetMessageId', '')
        
        return {
            'message_id': internet_message_id or message_data.get('id', ''),
            'graph_id': message_data.get('id', ''),
            'subject': message_data.get('subject', ''),
            'from_email': from_email,
            'from_name': from_name,
            'to_addresses': to_addresses,
            'to_header': ', '.join(to_addresses),
            'cc_addresses': cc_addresses,
            'cc_header': ', '.join(cc_addresses),
            'received_at': received_at,
            'plain_body': plain_body,
            'html_body': html_body,
            'attachments': [],  # Will be populated if needed
            'has_attachments': message_data.get('hasAttachments', False),
            'conversation_id': conversation_id,
            'is_read': message_data.get('isRead', False),
            'importance': message_data.get('importance', 'normal'),
            'in_reply_to': '',  # Graph API uses conversationId for threading
            'references': conversation_id,  # Use conversation ID for grouping
        }
    
    def fetch_unread_emails(self, folder: str = 'Inbox', limit: int = 50) -> List[Dict]:
        """
        Fetch unread emails from the specified folder.
        
        Args:
            folder: Folder name or ID to fetch from
            limit: Maximum number of emails to fetch
        
        Returns list of parsed email dictionaries.
        """
        if not self.access_token:
            if not self.connect():
                return []
        
        try:
            # Get folder ID if folder name provided
            folder_id = folder
            if not folder.startswith('AAM'):  # Graph folder IDs start with AAM
                folder_id = self.get_folder_id(folder)
                if not folder_id:
                    # Try well-known folder name
                    folder_id = folder.lower()
            
            # Fetch unread messages
            url = f"{self.GRAPH_API_BASE}/me/mailFolders/{folder_id}/messages"
            params = {
                '$filter': 'isRead eq false',
                '$top': limit,
                '$orderby': 'receivedDateTime desc',
                '$select': 'id,subject,from,toRecipients,ccRecipients,body,receivedDateTime,hasAttachments,isRead,importance,conversationId,internetMessageId',
            }
            
            response = requests.get(url, headers=self._get_headers(), params=params)
            
            if not response.ok:
                logger.error(f"Failed to fetch emails: {response.text}")
                return []
            
            data = response.json()
            messages = data.get('value', [])
            
            emails = []
            for msg in messages:
                parsed = self._parse_email(msg)
                parsed['_folder'] = folder
                parsed['_folder_id'] = folder_id
                emails.append(parsed)
            
            return emails
            
        except Exception as e:
            logger.error(f"Error fetching unread emails: {e}")
            return []
    
    def fetch_all_emails(self, folder: str = 'Inbox', limit: int = 50) -> List[Dict]:
        """
        Fetch all emails (read and unread) from the specified folder.
        
        Args:
            folder: Folder name or ID to fetch from
            limit: Maximum number of emails to fetch
        
        Returns list of parsed email dictionaries.
        """
        if not self.access_token:
            if not self.connect():
                return []
        
        try:
            # Get folder ID if folder name provided
            folder_id = folder
            if not folder.startswith('AAM'):
                folder_id = self.get_folder_id(folder)
                if not folder_id:
                    folder_id = folder.lower()
            
            # Fetch all messages
            url = f"{self.GRAPH_API_BASE}/me/mailFolders/{folder_id}/messages"
            params = {
                '$top': limit,
                '$orderby': 'receivedDateTime desc',
                '$select': 'id,subject,from,toRecipients,ccRecipients,body,receivedDateTime,hasAttachments,isRead,importance,conversationId,internetMessageId',
            }
            
            response = requests.get(url, headers=self._get_headers(), params=params)
            
            if not response.ok:
                logger.error(f"Failed to fetch emails: {response.text}")
                return []
            
            data = response.json()
            messages = data.get('value', [])
            
            emails = []
            for msg in messages:
                parsed = self._parse_email(msg)
                parsed['_folder'] = folder
                parsed['_folder_id'] = folder_id
                emails.append(parsed)
            
            return emails
            
        except Exception as e:
            logger.error(f"Error fetching all emails: {e}")
            return []
    
    def mark_as_read(self, message_id: str) -> bool:
        """
        Mark an email as read.
        
        Args:
            message_id: The Graph API message ID (graph_id)
        
        Returns True if successful.
        """
        if not self.access_token:
            return False
        
        try:
            url = f"{self.GRAPH_API_BASE}/me/messages/{message_id}"
            data = {'isRead': True}
            
            response = requests.patch(url, headers=self._get_headers(), json=data)
            return response.ok
        except Exception as e:
            logger.error(f"Error marking email as read: {e}")
            return False
    
    def move_to_folder(self, message_id: str, destination_folder: str) -> bool:
        """
        Move an email to a different folder.
        
        Args:
            message_id: The Graph API message ID
            destination_folder: Folder name or ID to move to
        
        Returns True if successful.
        """
        if not self.access_token:
            return False
        
        try:
            # Get destination folder ID
            folder_id = destination_folder
            if not destination_folder.startswith('AAM'):
                folder_id = self.get_folder_id(destination_folder)
                if not folder_id:
                    logger.error(f"Destination folder not found: {destination_folder}")
                    return False
            
            url = f"{self.GRAPH_API_BASE}/me/messages/{message_id}/move"
            data = {'destinationId': folder_id}
            
            response = requests.post(url, headers=self._get_headers(), json=data)
            return response.ok
        except Exception as e:
            logger.error(f"Error moving email: {e}")
            return False
    
    def get_attachments(self, message_id: str) -> List[Dict]:
        """
        Get attachments for a message.
        
        Args:
            message_id: The Graph API message ID
        
        Returns list of attachment dicts with 'name', 'contentType', 'size', 'contentBytes'.
        """
        if not self.access_token:
            return []
        
        try:
            url = f"{self.GRAPH_API_BASE}/me/messages/{message_id}/attachments"
            response = requests.get(url, headers=self._get_headers())
            
            if not response.ok:
                return []
            
            data = response.json()
            attachments = []
            
            for att in data.get('value', []):
                if att.get('@odata.type') == '#microsoft.graph.fileAttachment':
                    attachments.append({
                        'filename': att.get('name', ''),
                        'content_type': att.get('contentType', ''),
                        'size': att.get('size', 0),
                        'payload': att.get('contentBytes'),  # Base64 encoded
                    })
            
            return attachments
        except Exception as e:
            logger.error(f"Error getting attachments: {e}")
            return []
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
        return False


class EmailReader:
    """
    Class to read emails from an IMAP server.
    Uses the EMAIL_HELP_* settings for connection.
    """
    
    def __init__(self):
        self.host = getattr(settings, 'EMAIL_HELP_HOST', '')
        # Use IMAP port for reading emails (default 993 for SSL)
        self.port = int(getattr(settings, 'EMAIL_HELP_IMAP_PORT', 993))
        self.username = getattr(settings, 'EMAIL_HELP_HOST_USER', '')
        self.password = getattr(settings, 'EMAIL_HELP_HOST_PASSWORD', '')
        self.use_ssl = getattr(settings, 'EMAIL_HELP_USE_SSL', True)
        self.connection = None
    
    def connect(self) -> bool:
        """
        Establish connection to the IMAP server.
        """
        try:
            if self.use_ssl:
                # Create SSL context
                context = ssl.create_default_context()
                self.connection = imaplib.IMAP4_SSL(self.host, self.port, ssl_context=context)
            else:
                self.connection = imaplib.IMAP4(self.host, self.port)
            
            # Login
            self.connection.login(self.username, self.password)
            return True
        except Exception as e:
            print(f"Failed to connect to IMAP server: {e}")
            return False
    
    def disconnect(self):
        """
        Close the IMAP connection.
        """
        if self.connection:
            try:
                self.connection.logout()
            except:
                pass
            self.connection = None
    
    def list_folders(self) -> List[str]:
        """
        List all available mailbox folders.
        """
        if not self.connection:
            if not self.connect():
                return []
        
        folders = []
        try:
            status, folder_list = self.connection.list()
            if status == 'OK':
                for folder_data in folder_list:
                    if isinstance(folder_data, bytes):
                        # Parse folder name from response like: b'(\\HasNoChildren) "/" "INBOX"'
                        folder_str = folder_data.decode('utf-8', errors='replace')
                        # Extract folder name - it's usually the last quoted string or after the delimiter
                        import re
                        match = re.search(r'"([^"]+)"$', folder_str)
                        if match:
                            folders.append(match.group(1))
                        else:
                            # Try to get the last part after space (unquoted folder name)
                            parts = folder_str.strip().split()
                            if parts:
                                folders.append(parts[-1])
        except Exception as e:
            print(f"Error listing folders: {e}")
        
        return folders
    
    def get_tenant_folders(self, tenant_schemas: List[str]) -> List[str]:
        """
        Get list of folders that match registered tenant schema names.
        Some mail servers create folders based on plus addressing.
        """
        all_folders = self.list_folders()
        # Return folders that match tenant names (case-insensitive)
        tenant_lower = {t.lower() for t in tenant_schemas}
        matching = [f for f in all_folders if f.lower() in tenant_lower]
        return matching
    
    def _decode_header_value(self, value: str) -> str:
        """
        Decode email header value handling various encodings.
        """
        if not value:
            return ""
        
        decoded_parts = []
        for part, encoding in decode_header(value):
            if isinstance(part, bytes):
                try:
                    decoded_parts.append(part.decode(encoding or 'utf-8', errors='replace'))
                except:
                    decoded_parts.append(part.decode('utf-8', errors='replace'))
            else:
                decoded_parts.append(part)
        
        return ' '.join(decoded_parts)
    
    def _get_email_body(self, msg) -> Tuple[str, str]:
        """
        Extract plain text and HTML body from email message.
        Returns (plain_text, html_text)
        """
        plain_body = ""
        html_body = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                
                # Skip attachments
                if "attachment" in content_disposition:
                    continue
                
                try:
                    body = part.get_payload(decode=True)
                    if body:
                        charset = part.get_content_charset() or 'utf-8'
                        body = body.decode(charset, errors='replace')
                        
                        if content_type == "text/plain":
                            plain_body = body
                        elif content_type == "text/html":
                            html_body = body
                except Exception as e:
                    print(f"Error decoding email part: {e}")
        else:
            content_type = msg.get_content_type()
            try:
                body = msg.get_payload(decode=True)
                if body:
                    charset = msg.get_content_charset() or 'utf-8'
                    body = body.decode(charset, errors='replace')
                    
                    if content_type == "text/plain":
                        plain_body = body
                    elif content_type == "text/html":
                        html_body = body
            except Exception as e:
                print(f"Error decoding email body: {e}")
        
        return plain_body, html_body
    
    def _get_attachments(self, msg) -> List[Dict]:
        """
        Extract attachment metadata from email message.
        """
        attachments = []
        
        if msg.is_multipart():
            for part in msg.walk():
                content_disposition = str(part.get("Content-Disposition", ""))
                
                if "attachment" in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        filename = self._decode_header_value(filename)
                        content_type = part.get_content_type()
                        size = len(part.get_payload(decode=True) or b'')
                        
                        attachments.append({
                            'filename': filename,
                            'content_type': content_type,
                            'size': size,
                            'payload': part.get_payload(decode=True)
                        })
        
        return attachments
    
    def _parse_email(self, msg) -> Dict:
        """
        Parse an email message into a structured dictionary.
        """
        # Get headers
        message_id = msg.get('Message-ID', '')
        subject = self._decode_header_value(msg.get('Subject', ''))
        from_header = msg.get('From', '')
        to_header = msg.get('To', '')
        cc_header = msg.get('Cc', '')
        date_header = msg.get('Date', '')
        
        # Threading headers
        in_reply_to = msg.get('In-Reply-To', '')
        references = msg.get('References', '')
        
        # Parse addresses
        from_name, from_email = parseaddr(from_header)
        from_name = self._decode_header_value(from_name)
        
        # Parse date
        received_at = None
        if date_header:
            try:
                received_at = parsedate_to_datetime(date_header)
            except:
                pass
        
        # Get body
        plain_body, html_body = self._get_email_body(msg)
        
        # Get attachments
        attachments = self._get_attachments(msg)
        
        # Parse all To addresses (for plus addressing)
        to_addresses = []
        if to_header:
            # Handle multiple recipients
            for addr in to_header.split(','):
                _, to_email = parseaddr(addr.strip())
                if to_email:
                    to_addresses.append(to_email.lower())
        
        return {
            'message_id': message_id,
            'subject': subject,
            'from_email': from_email.lower() if from_email else '',
            'from_name': from_name,
            'to_addresses': to_addresses,
            'to_header': to_header,
            'cc_header': cc_header,
            'received_at': received_at,
            'plain_body': plain_body,
            'html_body': html_body,
            'attachments': attachments,
            'in_reply_to': in_reply_to.strip() if in_reply_to else '',
            'references': references.strip() if references else '',
            'raw_message': msg,
        }
    
    def fetch_unread_emails(self, folder: str = 'INBOX', limit: int = 50) -> List[Dict]:
        """
        Fetch unread emails from the specified folder.
        
        Returns a list of parsed email dictionaries.
        """
        if not self.connection:
            if not self.connect():
                return []
        
        emails = []
        
        try:
            # Select the mailbox
            status, data = self.connection.select(folder)
            if status != 'OK':
                print(f"Failed to select folder {folder}")
                return []
            
            # Search for unread emails
            status, message_ids = self.connection.search(None, 'UNSEEN')
            if status != 'OK':
                print("Failed to search for emails")
                return []
            
            # Get message IDs
            id_list = message_ids[0].split()
            
            # Limit the number of emails to fetch
            id_list = id_list[:limit] if len(id_list) > limit else id_list
            
            for msg_id in id_list:
                try:
                    # Fetch the email
                    status, msg_data = self.connection.fetch(msg_id, '(RFC822)')
                    if status != 'OK':
                        continue
                    
                    # Parse the email
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    parsed = self._parse_email(msg)
                    parsed['uid'] = msg_id.decode() if isinstance(msg_id, bytes) else msg_id
                    emails.append(parsed)
                    
                except Exception as e:
                    print(f"Error fetching email {msg_id}: {e}")
            
            return emails
            
        except Exception as e:
            print(f"Error fetching emails: {e}")
            return []
    
    def fetch_all_emails(self, folder: str = 'INBOX', limit: int = 50) -> List[Dict]:
        """
        Fetch all emails (read and unread) from the specified folder.
        
        Returns a list of parsed email dictionaries.
        """
        if not self.connection:
            if not self.connect():
                return []
        
        emails = []
        
        try:
            # Select the mailbox
            status, data = self.connection.select(folder)
            if status != 'OK':
                print(f"Failed to select folder {folder}")
                return []
            
            # Search for all emails
            status, message_ids = self.connection.search(None, 'ALL')
            if status != 'OK':
                print("Failed to search for emails")
                return []
            
            # Get message IDs
            id_list = message_ids[0].split()
            
            # Limit and get most recent (reverse order - newest first)
            id_list = id_list[-limit:] if len(id_list) > limit else id_list
            id_list = list(reversed(id_list))
            
            for msg_id in id_list:
                try:
                    # Fetch the email
                    status, msg_data = self.connection.fetch(msg_id, '(RFC822)')
                    if status != 'OK':
                        continue
                    
                    # Parse the email
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    parsed = self._parse_email(msg)
                    parsed['uid'] = msg_id.decode() if isinstance(msg_id, bytes) else msg_id
                    emails.append(parsed)
                    
                except Exception as e:
                    print(f"Error fetching email {msg_id}: {e}")
            
            return emails
            
        except Exception as e:
            print(f"Error fetching emails: {e}")
            return []
    
    def mark_as_seen(self, uid: str, folder: str = None):
        """
        Mark an email as seen/read.
        If folder is provided, selects that folder first.
        """
        if self.connection:
            try:
                if folder:
                    self.connection.select(folder)
                self.connection.store(uid.encode() if isinstance(uid, str) else uid, '+FLAGS', '\\Seen')
            except Exception as e:
                print(f"Error marking email as seen: {e}")
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
        return False


def get_tenant_from_plus_address(email_address: str) -> Optional[str]:
    """
    Extract tenant schema name from plus-addressed email.
    E.g., help+acme@coredesk.pro -> 'acme'
    
    Returns the tenant schema name or None if not a plus-addressed email.
    """
    import re
    match = re.match(r'^([^+]+)\+([^@]+)@(.+)$', email_address.lower())
    if match:
        return match.group(2)
    return None


def route_emails_to_tenants(emails: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Route emails to their respective tenants based on plus addressing.
    
    Returns a dictionary mapping tenant schema names to their emails.
    """
    routed = {}
    unrouted = []
    
    for email_data in emails:
        tenant_found = False
        
        # Check all To addresses for plus addressing
        for to_addr in email_data.get('to_addresses', []):
            tenant_schema = get_tenant_from_plus_address(to_addr)
            if tenant_schema:
                if tenant_schema not in routed:
                    routed[tenant_schema] = []
                email_data['matched_tenant_email'] = to_addr
                routed[tenant_schema].append(email_data)
                tenant_found = True
                break
        
        if not tenant_found:
            unrouted.append(email_data)
    
    if unrouted:
        routed['_unrouted'] = unrouted
    
    return routed


def normalize_subject(subject: str) -> str:
    """
    Normalize email subject for threading by removing Re:, Fwd:, etc.
    """
    import re
    # Remove common reply/forward prefixes
    normalized = re.sub(r'^(re|fwd|fw|aw|sv|vs|antw):\s*', '', subject.lower().strip(), flags=re.IGNORECASE)
    # Remove multiple spaces
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized.strip()


def group_emails_into_threads(emails: List[Dict]) -> List[Dict]:
    """
    Group emails into conversation threads based on:
    1. In-Reply-To / References headers
    2. Normalized subject line
    
    Returns a list of thread dictionaries with:
    - 'thread_id': unique identifier (message_id of first email)
    - 'subject': thread subject
    - 'emails': list of emails in chronological order
    - 'email_count': number of emails in thread
    """
    if not emails:
        return []
    
    # Build a mapping of message_id to email
    email_by_id = {}
    for email_data in emails:
        msg_id = email_data.get('message_id', '').strip()
        if msg_id:
            email_by_id[msg_id] = email_data
    
    # Build threads by following reply chains
    threads = {}  # normalized_subject -> thread
    email_to_thread = {}  # message_id -> thread_id
    
    # Sort emails by date (oldest first)
    sorted_emails = sorted(
        emails, 
        key=lambda e: e.get('received_at') or e.get('date') or ''
    )
    
    for email_data in sorted_emails:
        msg_id = email_data.get('message_id', '').strip()
        in_reply_to = email_data.get('in_reply_to', '').strip()
        references = email_data.get('references', '').split()
        subject = email_data.get('subject', '')
        normalized_subj = normalize_subject(subject)
        
        thread_id = None
        
        # Try to find existing thread via In-Reply-To
        if in_reply_to and in_reply_to in email_to_thread:
            thread_id = email_to_thread[in_reply_to]
        
        # Try to find via References
        if not thread_id:
            for ref in references:
                ref = ref.strip()
                if ref in email_to_thread:
                    thread_id = email_to_thread[ref]
                    break
        
        # Try to find via normalized subject
        if not thread_id and normalized_subj in threads:
            thread_id = normalized_subj
        
        # Create new thread if none found
        if not thread_id:
            thread_id = normalized_subj or msg_id or f"thread_{len(threads)}"
            threads[thread_id] = {
                'thread_id': thread_id,
                'subject': subject,
                'emails': [],
                'from_email': email_data.get('from_email', ''),
                'from_name': email_data.get('from_name', ''),
            }
        
        # Add email to thread
        threads[thread_id]['emails'].append(email_data)
        if msg_id:
            email_to_thread[msg_id] = thread_id
    
    # Finalize threads
    result = []
    for thread_id, thread in threads.items():
        # Sort emails in thread by date
        thread['emails'] = sorted(
            thread['emails'],
            key=lambda e: e.get('received_at') or ''
        )
        thread['email_count'] = len(thread['emails'])
        # Use first email's subject as thread subject
        if thread['emails']:
            first_email = thread['emails'][0]
            thread['subject'] = first_email.get('subject', '')
            thread['from_email'] = first_email.get('from_email', '')
            thread['from_name'] = first_email.get('from_name', '')
            thread['started_at'] = first_email.get('received_at')
            if len(thread['emails']) > 1:
                thread['last_reply_at'] = thread['emails'][-1].get('received_at')
        result.append(thread)
    
    # Sort threads by most recent activity
    result = sorted(
        result,
        key=lambda t: t.get('last_reply_at') or t.get('started_at') or '',
        reverse=True
    )
    
    return result


def group_outlook_emails_into_threads(emails: List[Dict]) -> List[Dict]:
    """
    Group Outlook emails into conversation threads using Microsoft's conversationId.
    
    This is more reliable than subject-based threading as Microsoft Graph API
    provides a unique conversation identifier.
    
    Returns a list of thread dictionaries with:
    - 'thread_id': conversation ID
    - 'subject': thread subject
    - 'emails': list of emails in chronological order
    - 'email_count': number of emails in thread
    """
    if not emails:
        return []
    
    threads = {}  # conversation_id -> thread
    
    for email_data in emails:
        conversation_id = email_data.get('conversation_id', '')
        subject = email_data.get('subject', '')
        
        # If no conversation_id, use subject-based grouping as fallback
        if not conversation_id:
            conversation_id = normalize_subject(subject) or email_data.get('message_id', '')
        
        if conversation_id not in threads:
            threads[conversation_id] = {
                'thread_id': conversation_id,
                'subject': subject,
                'emails': [],
                'from_email': email_data.get('from_email', ''),
                'from_name': email_data.get('from_name', ''),
            }
        
        threads[conversation_id]['emails'].append(email_data)
    
    # Finalize threads
    result = []
    for conversation_id, thread in threads.items():
        # Sort emails in thread by date (oldest first)
        thread['emails'] = sorted(
            thread['emails'],
            key=lambda e: e.get('received_at') or ''
        )
        thread['email_count'] = len(thread['emails'])
        
        # Use first email's info as thread info
        if thread['emails']:
            first_email = thread['emails'][0]
            thread['subject'] = first_email.get('subject', '')
            thread['from_email'] = first_email.get('from_email', '')
            thread['from_name'] = first_email.get('from_name', '')
            thread['started_at'] = first_email.get('received_at')
            if len(thread['emails']) > 1:
                thread['last_reply_at'] = thread['emails'][-1].get('received_at')
        
        result.append(thread)
    
    # Sort threads by most recent activity (newest first)
    result = sorted(
        result,
        key=lambda t: t.get('last_reply_at') or t.get('started_at') or '',
        reverse=True
    )
    
    return result
