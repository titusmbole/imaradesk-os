/**
 * Utility functions for backoffice API calls
 */

/**
 * Make a POST request to backoffice API
 * @param {string} url - API endpoint URL
 * @param {object} data - Request body data
 * @returns {Promise<{ok: boolean, data: any, status: number}>}
 */
export async function securePost(url, data = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    })

    const responseData = await response.json()
    return {
      ok: response.ok,
      data: responseData,
      status: response.status,
    }
  } catch (error) {
    return {
      ok: false,
      data: { error: 'Network error. Please try again.' },
      status: 0,
    }
  }
}

/**
 * Make a GET request to backoffice API
 * @param {string} url - API endpoint URL
 * @returns {Promise<{ok: boolean, data: any, status: number}>}
 */
export async function secureGet(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
    })

    const responseData = await response.json()
    return {
      ok: response.ok,
      data: responseData,
      status: response.status,
    }
  } catch (error) {
    return {
      ok: false,
      data: { error: 'Network error. Please try again.' },
      status: 0,
    }
  }
}
