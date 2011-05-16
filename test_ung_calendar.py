from base import BaseUNGTest
import unittest

from time import localtime

class TestUNGCalendar(BaseUNGTest):
    def test_ung_calendar(self):
        sel = self.selenium
        self.init()
        self.login_as_default_user()
        sel.open("calendar")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("Refresh", sel.get_text("//span[@class='showdayflash']"))
        self.assertEqual("Su", sel.get_text("//span[@title='Sunday']"))
        sel.click("//span[@class='showmonthview']")
        sel.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        sel.click("//span[@class='showdayview']")
        sel.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        sel.type("//input[@name='searchable-text']", "UNG Event")
        sel.click("//input[@id='submit-search']")
        sel.wait_for_condition("selenium.isElementPresent('//div[@id=\"blank-result\"]')", "1000")
        self.assertEqual("Results: 0 to UNG Event", sel.get_text("//td[@id=\"resultview\"]"))
        self.failUnless(sel.is_text_present("No Results"))
        sel.click("//a[@id=\"back-calendar\"]")
        sel.wait_for_page_to_load("30000")
        sel.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        sel.click("//span[@class=\"addcal\"]")
        sel.wait_for_condition("selenium.isElementPresent(\"portal_type\")", "10000")
        sel.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        sel.select("//select[@name=\"portal_type\"]", "Note")
        sel.type("//input[@name=\"title\"]", "My Event")
        sel.type("//textarea[@name=\"event_text_content\"]", "Text of Event")
        sel.type("//input[@name=\"start_date_hour\"]", localtime().tm_hour + 1)
        sel.type("//input[@name=\"stop_date_hour\"]", localtime().tm_hour + 1)
        sel.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        self.wait_for_activities()
        sel.open("calendar")
        sel.wait_for_page_to_load("30000")
        sel.wait_for_condition("selenium.isTextPresent('My Event')", "10000")
        self.failUnless(sel.is_text_present("My Event"))
        sel.type("//input[@name='searchable-text']", "My Event")
        sel.click("//input[@id='submit-search']")
        sel.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(sel.is_element_present("//td[@id=\"event-date\"]"))
        sel.open("calendar")
        sel.wait_for_page_to_load("30000")
        sel.click("//span[@class=\"addcal\"]")
        sel.wait_for_condition("selenium.isElementPresent(\"portal_type\")", "10000")
        sel.select("//select[@name=\"portal_type\"]", "Note")
        sel.type("//input[@name=\"title\"]", "My Second Event")
        sel.type("//textarea[@name=\"event_text_content\"]", "Second Event")
        sel.type("//input[@name=\"start_date_hour\"]",localtime().tm_hour + 1)
        sel.type("//input[@name=\"stop_date_hour\"]", localtime().tm_hour + 1)
        sel.key_press("//input[@name=\"stop_date_hour\"]", "\\13")
        self.wait_for_activities()
        sel.open("calendar")
        sel.wait_for_page_to_load("30000")
        sel.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        sel.type("//input[@name='searchable-text']", "My Second Event")
        sel.click("//input[@id='submit-search']")
        sel.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        sel.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "2000")
        self.failUnless(sel.is_element_present("//td[@id=\"event-date\"]"))
        sel.open("calendar")
        sel.wait_for_page_to_load("30000")
        sel.type("//input[@name='searchable-text']", "My Second Event")
        sel.key_press("//input[@name='searchable-text']", "\\13")
        self.failIf(sel.is_text_present("No Results"))

if __name__ == "__main__":
    unittest.main()

