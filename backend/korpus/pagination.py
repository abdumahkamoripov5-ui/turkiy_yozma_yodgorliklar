from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Standart 20 ta; frontend ?page_size= bilan ko'proq so'rashi mumkin (maks. 200)."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200
