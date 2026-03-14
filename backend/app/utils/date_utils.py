from datetime import datetime


def get_day_from_date(date_str: str):

    date_obj = datetime.strptime(date_str, "%Y-%m-%d")

    return date_obj.strftime("%A")