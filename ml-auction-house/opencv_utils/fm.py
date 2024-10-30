def get_fm_from_template_name(template_name):
    return (template_name.split('FreeMarket')[-1]).split('.')[0]