from django import template
from korpus.models import MonumentSubmission

register = template.Library()


@register.simple_tag(takes_context=True)
def studio_navigation(context):
    """Use Django's permission-filtered models and keep technical tools folded."""
    core_order = ['Monument', 'MonumentLine', 'WordEntry', 'WordForm', 'ReadingVariant', 'WordPoll', 'MonumentSubmission']
    labels = {'Monument': 'Yodgorliklar', 'WordEntry': 'Lug‘at', 'WordPoll': 'Ovoz berish',
              'MonumentSubmission': 'Takliflar', 'User': 'Foydalanuvchilar', 'Group': 'Rollar va ruxsatlar',
              'SourceLink': 'Manbalar', 'SiteSettings': 'Sayt sozlamalari',
              'UserActivity': 'Faoliyat tarixi', 'LoginActivity': 'Kirish tarixi',
              'MonumentLine': 'Satrlar va suratlar', 'WordForm': 'Morfologik tahlillar', 'ReadingVariant': 'O‘qilish variantlari'}
    extra_order = ['User', 'Group', 'SourceLink', 'SiteSettings', 'UserActivity', 'LoginActivity']
    core, extra = [], []
    request = context.get('request')
    extra_open = False
    for app in context.get('available_apps', []):
        for model in app['models']:
            item = dict(model)
            item['name'] = labels.get(item['object_name'], item['name'])
            url = item.get('admin_url')
            item['active'] = bool(url and request and request.path.startswith(url))
            if app['app_label'] == 'korpus' and item['object_name'] in core_order:
                core.append(item)
            else:
                extra.append(item)
                extra_open = extra_open or item['active']
    core.sort(key=lambda item: core_order.index(item['object_name']))
    extra.sort(key=lambda item: extra_order.index(item['object_name'])
               if item['object_name'] in extra_order else len(extra_order))
    return {'core': core, 'extra': extra, 'extra_open': extra_open}


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
