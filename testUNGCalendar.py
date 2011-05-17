from UNGTestMixin import UNGTestMixin
import unittest

class TestUNGCalendar(UNGTestMixin):
    """ Tests related to UNG Calendar
    """
    def test_simple_add_of_two_note_events(self):
        """
        - Test that shortcut buttons 'Month View' and 'Day View' exists.
        - Search for events, and assert that no event was found with correct
            message.
        - Add 2 events, both of type 'Note'.
        - Search for events, and assert that events were found with correct
            message.
        - Search by pressing key 'Enter' (code \13)
        """
        test_subject_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Refresh", self.selenium.get_text("//span[@class='showdayflash']"))
        self.assertEqual("Su", self.selenium.get_text("//span[@title='Sunday']"))
        self.selenium.click("//span[@class='showmonthview']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.click("//span[@class='showdayview']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.type("//input[@name='searchable-text']", "My Event %d" % test_subject_time)
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//div[@id=\"blank-result\"]')", "1000")
        self.assertEqual("Results: 0 to My Event %d" % test_subject_time, self.selenium.get_text("//td[@id=\"resultview\"]"))
        self.failUnless(self.selenium.is_text_present("No Results"))
        self.selenium.click("//a[@id=\"back-calendar\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.click("//span[@class=\"addcal\"]")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"portal_type\")", "10000")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.select("//select[@name=\"portal_type\"]", "Note")
        self.selenium.type("//input[@name=\"title\"]", "My Event %d" % test_subject_time)
        self.selenium.type("//textarea[@name=\"event_text_content\"]", "Text of Event")
        self.selenium.type("//input[@name=\"start_date_hour\"]", unittest.time.localtime().tm_hour + 1)
        self.selenium.type("//input[@name=\"stop_date_hour\"]", unittest.time.localtime().tm_hour + 1)
        self.selenium.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        #XXX handle this behaviour differently: activities is called twice
        # because sometimes its passing through method even with some present
        # activities
        self.wait_for_activities()
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.wait_for_condition("selenium.isTextPresent('My Event %d')" % test_subject_time, "10000")
        self.failUnless(self.selenium.is_text_present("My Event %d" % test_subject_time))
        self.selenium.type("//input[@name='searchable-text']", "My Event %d" % test_subject_time)
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.click("//span[@class=\"addcal\"]")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"portal_type\")", "10000")
        self.selenium.select("//select[@name=\"portal_type\"]", "Note")
        self.selenium.type("//input[@name=\"title\"]", "My Second Event %d" % test_subject_time)
        self.selenium.type("//textarea[@name=\"event_text_content\"]", "Second Event")
        self.selenium.type("//input[@name=\"start_date_hour\"]", unittest.time.localtime().tm_hour + 1)
        self.selenium.type("//input[@name=\"stop_date_hour\"]", unittest.time.localtime().tm_hour + 1)
        self.selenium.key_press("//input[@name=\"stop_date_hour\"]", "\\13")
        self.wait_for_activities()
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.type("//input[@name='searchable-text']", "My Second Event %d" % test_subject_time)
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "2000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.type("//input[@name='searchable-text']", "My Second Event %d" % test_subject_time)
        self.selenium.key_press("//input[@name='searchable-text']", "\\13")
        self.failIf(self.selenium.is_text_present("No Results"))

if __name__ == "__main__":
    unittest.main()

