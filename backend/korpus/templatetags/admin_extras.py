from django import template
from korpus.models import MonumentSubmission

register = template.Library()


@register.simple_tag(takes_context=True)
def studio_dashboard(context):
    from korpus.admin_dashboard import dashboard_data
    return dashboard_data(context.get('request'))


@register.filter
def studio_initial(value):
    return str(value).strip()[:1].upper()

@register.simple_tag
def pending_count():
    return MonumentSubmission.objects.filter(status='pending').count()
