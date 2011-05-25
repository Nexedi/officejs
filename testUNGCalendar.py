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

    def test_add_new_acknowledgement_event(self):
        """check the action of add a new event of type 'Acknowledgement'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Acknowledgement'
        event_name = 'Functional UNG Test %d - My Acknowledgement' % test_time
        self.create_calendar_event('Acknowledgement', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.click("//div/span[@title='Refresh view']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_fax_message_event(self):
        """check the action of add a new event of type 'Fax Message'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Fax Message'
        event_name = 'Functional UNG Test %d - My Fax Message' % test_time
        self.create_calendar_event('Fax Message', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.click("//div/span[@title='Refresh view']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_letter_event(self):
        """check the action of add a new event of type 'Letter'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Letter'
        event_name = 'Functional UNG Test %d - My Letter' % test_time
        self.create_calendar_event('Letter', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.click("//div/span[@title='Refresh view']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_mail_message_event(self):
        """check the action of add a new event of type 'Mail Message'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Mail Message'
        event_name = 'Functional UNG Test %d - My Mail Message' % test_time
        self.create_calendar_event('Mail Message', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.click("//div/span[@title='Refresh view']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_note_event(self):
        """check the action of add a new event of type 'Note'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Note'
        event_name = 'Functional UNG Test %d - My Note' % test_time
        self.create_calendar_event('Note', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.failUnless(self.selenium.is_text_present(event_name))
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_phone_call_event(self):
        """check the action of add a new event of type 'Phone Call'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Phone Call'
        event_name = 'Functional UNG Test %d - My Phone Call' % test_time
        self.create_calendar_event('Phone Call', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.failUnless(self.selenium.is_text_present(event_name))
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_short_message_event(self):
        """check the action of add a new event of type 'Short Message'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Short Message'
        event_name = 'Functional UNG Test %d - My Short Message' % test_time
        self.create_calendar_event('Short Message', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.failUnless(self.selenium.is_text_present(event_name))
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_site_message_event(self):
        """check the action of add a new event of type 'Site Message'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Site Message'
        event_name = 'Functional UNG Test %d - My Site Message' % test_time
        self.create_calendar_event('Site Message', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.failUnless(self.selenium.is_text_present(event_name))
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_visit_event(self):
        """check the action of add a new event of type 'Visit'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Visit'
        event_name = 'Functional UNG Test %d - My Visit' % test_time
        self.create_calendar_event('Visit', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.failUnless(self.selenium.is_text_present(event_name))
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_add_new_web_message_event(self):
        """check the action of add a new event of type 'Web Message'"""
        test_time = int(unittest.time.time())
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #create event of type 'Web Message'
        event_name = 'Functional UNG Test %d - My Web Message' % test_time
        self.create_calendar_event('Web Message', name=event_name)
        #assert event was created successfully
        self.clear_cache()
        self.wait_for_activities()
        self.selenium.open("calendar")
        self.selenium.wait_for_page_to_load("30000")
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(event_name))
                if self.selenium.is_text_present(event_name):
                    break
            except:
                pass
        self.failUnless(self.selenium.is_text_present(event_name))
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "4000")
        self.failUnless(self.selenium.is_element_present("//td[@id=\"event-date\"]"))
        self.failIf(self.selenium.is_text_present("No Results"))
        self.assertEqual(event_name, self.selenium.get_text("//div[@class='event-listview']/table/tbody/tr/td[3]"))

    def test_modify_day_month_year_of_event(self):
        """test to verify that changing day, month or year of an event
        will update it"""
        test_time = int(unittest.time.time())
        #create an event
        self.open_ung_default_page("calendar")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #create event of type 'Visit'
        event_name = 'Functional UNG Test %d - My Event' % test_time
        self.create_calendar_event('Note', name=event_name)
        #assert event object is displayed
        self.selenium.is_element_present("//div[contains(@title,'Title:%s')]" % event_name)

        #change day of event
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        #XXX due to limitation of days in a month
        old_event_start_day = int(self.selenium.get_value("start_date_day"))
        new_event_start_day = old_event_start_day > 26 and 1 or old_event_start_day + 1
        old_event_stop_day = int(self.selenium.get_value("stop_date_day"))
        new_event_stop_day = old_event_stop_day > 26 and 1 or old_event_stop_day + 1
        self.selenium.type("start_date_day", new_event_start_day)
        self.selenium.type("stop_date_day", new_event_stop_day)
        self.selenium.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        self.open_ung_default_page("calendar", clear_cache=1, wait_for_activities=1)
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #"surf" to the event
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "10000")
        self.selenium.click("//td[@id='event-date']")
        #check new start and stop days on event
        self.selenium.wait_for_condition("selenium.isElementPresent('//div[contains(@title,\"Title:%s\")]')" % event_name, "10000")
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        self.assertEqual(new_event_start_day, int(self.selenium.get_value("start_date_day")))
        self.assertEqual(new_event_stop_day, int(self.selenium.get_value("stop_date_day")))
        self.selenium.click("//a[@class='ui-dialog-titlebar-close ui-corner-all']")

        #change month of event
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        #XXX due to limitation of months in a year
        old_event_start_month = int(self.selenium.get_value("start_date_month"))
        new_event_start_month = old_event_start_month > 11 and 1 or old_event_start_month + 1
        old_event_stop_month = int(self.selenium.get_value("stop_date_month"))
        new_event_stop_month = old_event_stop_month > 11 and 1 or old_event_stop_month + 1
        self.selenium.type("start_date_month", new_event_start_month)
        self.selenium.type("stop_date_month", new_event_stop_month)
        self.selenium.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        self.open_ung_default_page("calendar", clear_cache=1, wait_for_activities=1)
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #"surf" to the event
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "10000")
        self.selenium.click("//td[@id='event-date']")
        #check new start and stop months on event
        self.selenium.wait_for_condition("selenium.isElementPresent('//div[contains(@title,\"Title:%s\")]')" % event_name, "10000")
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        self.assertEqual(new_event_start_month, int(self.selenium.get_value("start_date_month")))
        self.assertEqual(new_event_stop_month, int(self.selenium.get_value("stop_date_month")))
        self.selenium.click("//a[@class='ui-dialog-titlebar-close ui-corner-all']")

        #change year of event
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        old_event_start_year = int(self.selenium.get_value("start_date_year"))
        new_event_start_year = old_event_start_year + 1
        old_event_stop_year = int(self.selenium.get_value("stop_date_year"))
        new_event_stop_year = old_event_stop_year + 1
        self.selenium.type("start_date_year", new_event_start_year)
        self.selenium.type("stop_date_year", new_event_stop_year)
        self.selenium.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        self.open_ung_default_page("calendar", clear_cache=1, wait_for_activities=1)
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #"surf" to the event
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "10000")
        self.selenium.click("//td[@id='event-date']")
        #check new start and stop years on event
        self.selenium.wait_for_condition("selenium.isElementPresent('//div[contains(@title,\"Title:%s\")]')" % event_name, "10000")
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        self.assertEqual(new_event_start_year, int(self.selenium.get_value("start_date_year")))
        self.assertEqual(new_event_stop_year, int(self.selenium.get_value("stop_date_year")))
        self.selenium.click("//a[@class='ui-dialog-titlebar-close ui-corner-all']")


if __name__ == "__main__":
    unittest.main()

