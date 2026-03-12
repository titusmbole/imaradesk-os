from django.apps import AppConfig


class SurveysConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.surveys'
    verbose_name = 'Surveys & Feedback'

    def ready(self):
        # Import signals to register them
        import modules.surveys.signals  # noqa
