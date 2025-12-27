from django.contrib import admin
from django.utils.html import format_html # لإظهار كود HTML\ (الصورة)
from .model.models import Book, Transaction

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    # الأعمدة التي ستظهر في القائمة
    list_display = ('get_image', 'title', 'author', 'quantity')

    # إضافة خانة بحث
    search_fields = ('title', 'author')

    # دالة لعرض صورة الغلاف بشكل مصغر داخل الجدول
    def get_image(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" width="50" style="border-radius:5px;" />', obj.cover_image.url)
        return "No Image"

    get_image.short_description = 'Cover' # اسم العمود في اللوحة

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'action_type', 'date')
    list_filter = ('action_type', 'date') # فلاتر جانبية للبحث السريع
