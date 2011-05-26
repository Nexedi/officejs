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

    def test_create_multiple_events_by_click(self):
        """test possibility to create multiple events by just clicking
        on UNG Calendar interface"""
        self.open_ung_default_page("calendar")
        #create 4 events, each one on its specific 'day-column'
        test_time = int(unittest.time.time())
        event_name = "Functional UNG Test %d - Event %d"
        for event_index in range(1, 5):
            self.selenium.click_at("//div[@id='tgCol%d' and @class='tg-col-eventwrapper']" % event_index, (1,1))
            self.selenium.type("//input[@id='bbit-cal-what']", event_name % (test_time, event_index))
            self.selenium.click("//input[@id='bbit-cal-quickAddBTN']")
            self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.wait_for_activities()
        self.open_ung_default_page('calendar', clear_cache=1, wait_for_activities=1)
        #assert events are present
        for event_index in range(1, 5):
            self.assertTrue(self.selenium.is_text_present(event_name % (test_time, event_index)))

    def test_check_calendar_buttons(self):
        """Test if the buttons Month, Day, Week shows the appropriate calendar
        including the date range at calendar bar (near by previous/next
        period arrows)."""
        #XXX this test needs an empty instance
        # due to the button 'other#' under month view, when there are many
        # events do be displayed in just one day
        self.open_ung_default_page("calendar")
        test_time = int(unittest.time.time())
        #create 4 events:
        # 2 on same day, and another on same week
        # last one on next week
        event_name = "Functional UNG %d - Event %d"
        dates = [(9, 13), (9, 13), (9, 16), (9, 20)]
        for event_index, (month, day) in enumerate(dates):
            self.create_calendar_event('Note',
                                        event_name % (test_time, event_index),
                                        start_month = month, start_day = day,
                                        start_year=2011,
                                        do_refresh=False)

        #select month view
        self.selenium.click("//span[@class='showmonthview']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.assertTrue('fcurrent' in self.selenium.get_attribute("//div[@id='showmonthbtn']@class"))
        #select month 9/2011 (month starts at 0)
        self.selenium.run_script("$('#gridcontainer').gotoDate(new Date(2011, 8, 13)).BcalGetOp();")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #wait due to interface delay
        unittest.time.sleep(2)
        #update page
        self.selenium.click("//span[@class='showmonthview']")
        self.selenium.click("//div/span[@title='Refresh view']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #XXX due to interface delay again, try two times
        # on second, sleeping 3 seconds before refreshing page again
        try:
            for event_index in range(len(dates)):
                self.assertTrue(self.selenium.is_text_present(event_name % (test_time, event_index)))
        except:
            unittest.time.sleep(3)
            self.selenium.click("//div/span[@title='Refresh view']")
            self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
            for event_index in range(len(dates)):
                self.assertTrue(self.selenium.is_text_present(event_name % (test_time, event_index)))
        #assert date displayed
        self.assertEqual('Aug 28 2011 - Oct 1', self.selenium.get_text("//div[@id='display-datetime']"))

        #select week view
        self.selenium.click("//span[@class='showweekview']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.assertTrue('fcurrent' in self.selenium.get_attribute("//div[@id='showweekbtn']@class"))
        #select day 09/13/2011 (month starts at 0)
        self.selenium.run_script("$('#gridcontainer').gotoDate(new Date(2011, 8, 13)).BcalGetOp();")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.click("//div/span[@title='Refresh view']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #assert just the 3 events from days 13 and 16 are present
        for event_index in range(3):
            self.assertTrue(self.selenium.is_text_present(event_name % (test_time, event_index)))
        #assert fourth event (event number 3, starting from 0) is not present
        self.assertFalse(self.selenium.is_text_present(event_name % (test_time, 3)))
        #assert date displayed
        self.assertEqual('Sep 11 2011 - Sep 17', self.selenium.get_text("//div[@id='display-datetime']"))

        #select day view
        self.selenium.click("//span[@class='showdayview']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.assertTrue('fcurrent' in self.selenium.get_attribute("//div[@id='showdaybtn']@class"))
        #select day 09/13/2011 (month starts at 0)
        self.selenium.run_script("$('#gridcontainer').gotoDate(new Date(2011, 8, 13)).BcalGetOp();")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.click("//div/span[@title='Refresh view']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #assert just the 2 events from day 13 are present
        for event_index in range(2):
            self.assertTrue(self.selenium.is_text_present(event_name % (test_time, event_index)))
        #assert third and fourth event (event number 2 and 3, starting from 0)
        # are not present
        for event_index in range(2, 4):
            self.assertFalse(self.selenium.is_text_present(event_name % (test_time, event_index)))
        #assert date displayed
        self.assertEqual('Sep 13 2011', self.selenium.get_text("//div[@id='display-datetime']"))

    def test_refresh_button_should_not_multiplicate_event(self):
        """test that 'Refresh' button doesn't multiplicate an event that was
        just created"""
        self.open_ung_default_page("calendar")
        #create event
        test_time = int(unittest.time.time())
        event_name = "Functional UNG Test %d - An Event" % test_time
        self.selenium.click_at("//div[@id='tgCol1' and @class='tg-col-eventwrapper']", (1,1))
        self.selenium.type("//input[@id='bbit-cal-what']", event_name)
        self.selenium.click("//input[@id='bbit-cal-quickAddBTN']")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.open_ung_default_page('calendar', clear_cache=1, wait_for_activities=1)
        #assert event is present
        self.assertTrue(self.selenium.is_text_present(event_name))
        #click refresh button 10 times
        for _refresh in range(5):
            self.selenium.click("//div/span[@title='Refresh view']")
            self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #assert only 1 event is present
        self.assertEqual(1, self.selenium.get_xpath_count("//div[contains(@title,'Title:%s')]" % event_name))

    def test_edit_event(self):
        """test edit and event, including change the portal types"""
        test_time = int(unittest.time.time())
        self.open_ung_default_page('calendar')
        #create event with specific properties
        event_name = "Functional UNG Test %d - A Note" % test_time
        event_type = 'Note'
        localtime = unittest.time.localtime()
        event_kw = {"start_month" : 01,
                            "end_month" : 01,
                            "start_day" : 01,
                            "end_day" : 01,
                            "start_year" : 2011,
                            "end_year" : 2011,
                            "start_hour" : 01,
                            "end_hour" : 01,
                            "start_minute" : 01,
                            "end_minute" : 01}
        self.create_calendar_event(event_type, event_name, do_refresh=False, **event_kw)
        self.open_ung_default_page("calendar", clear_cache=1, wait_for_activities=1)
        #XXX due to either a bug on javascript that doesn't allow to search
        # or delay on creation of document
        self.selenium.run_script("$('#gridcontainer').gotoDate(new Date(2011, 00, 01)).BcalGetOp();")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        #assert event properties
        self.assertTrue(self.selenium.is_text_present(event_name))
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        self.assertEqual(event_type, self.selenium.get_selected_value("//select[@name=\"portal_type\"]"))
        self.assertEqual(event_name, self.selenium.get_value("//input[@name=\"title\"]"))
        self.assertEqual(event_kw["start_month"], int(self.selenium.get_value("start_date_month")))
        self.assertEqual(event_kw["end_month"], int(self.selenium.get_value("stop_date_month")))
        self.assertEqual(event_kw["start_day"], int(self.selenium.get_value("start_date_day")))
        self.assertEqual(event_kw["end_day"], int(self.selenium.get_value("stop_date_day")))
        self.assertEqual(event_kw["start_year"], int(self.selenium.get_value("start_date_year")))
        self.assertEqual(event_kw["end_year"], int(self.selenium.get_value("stop_date_year")))
        self.assertEqual(event_kw["start_hour"], int(self.selenium.get_value("start_date_hour")))
        self.assertEqual(event_kw["end_hour"], int(self.selenium.get_value("stop_date_hour")))
        self.assertEqual(event_kw["start_minute"], int(self.selenium.get_value("start_date_minute")))
        self.assertEqual(event_kw["end_minute"], int(self.selenium.get_value("stop_date_minute")))
        #change event properties
        for key, value in event_kw.items():
            event_kw[key] = event_kw[key] + 2
        event_type = 'Letter'
        event_name = "Functional UNG Test %d - A Letter" % test_time
        self.selenium.select("//select[@name=\"portal_type\"]", event_type)
        self.selenium.type("//input[@name=\"title\"]", event_name)
        self.selenium.type("start_date_month", event_kw["start_month"])
        self.selenium.type("stop_date_month", event_kw["end_month"])
        self.selenium.type("start_date_day", event_kw["start_day"])
        self.selenium.type("stop_date_day", event_kw["end_day"])
        self.selenium.type("start_date_year", event_kw["start_year"])
        self.selenium.type("stop_date_year", event_kw["end_year"])
        self.selenium.type("start_date_hour", event_kw["start_hour"])
        self.selenium.type("stop_date_hour", event_kw["end_hour"])
        self.selenium.type("start_date_minute", event_kw["start_minute"])
        self.selenium.type("stop_date_minute", event_kw["end_minute"])
        self.selenium.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        self.wait_for_activities()
        self.open_ung_default_page("calendar", clear_cache=1, wait_for_activities=1)
        #XXX due to page delay
        unittest.time.sleep(1)
        #XXX this time search is possible
        self.selenium.type("//input[@name='searchable-text']", '\"' + event_name + '\"')
        self.selenium.click("//input[@id='submit-search']")
        self.selenium.wait_for_condition("selenium.isElementPresent('//td[@id=\"event-date\"]')", "10000")
        self.selenium.click("//td[@id=\"event-date\"]")
        self.selenium.wait_for_condition("selenium.isTextPresent(\"%s\")" % event_name, "10000")
        #assert new event properties
        self.assertTrue(self.selenium.is_text_present(event_name))
        self.selenium.click("//div[contains(@title,'Title:%s')]" % event_name)
        self.selenium.click("//span[@id='bbit-cs-editLink']")
        self.assertEqual(event_type, self.selenium.get_selected_value("//select[@name=\"portal_type\"]"))
        self.assertEqual(event_name, self.selenium.get_value("//input[@name=\"title\"]"))
        self.assertEqual(event_kw["start_month"], int(self.selenium.get_value("start_date_month")))
        self.assertEqual(event_kw["end_month"], int(self.selenium.get_value("stop_date_month")))
        self.assertEqual(event_kw["start_day"], int(self.selenium.get_value("start_date_day")))
        self.assertEqual(event_kw["end_day"], int(self.selenium.get_value("stop_date_day")))
        self.assertEqual(event_kw["start_year"], int(self.selenium.get_value("start_date_year")))
        self.assertEqual(event_kw["end_year"], int(self.selenium.get_value("stop_date_year")))
        self.assertEqual(event_kw["start_hour"], int(self.selenium.get_value("start_date_hour")))
        self.assertEqual(event_kw["end_hour"], int(self.selenium.get_value("stop_date_hour")))
        self.assertEqual(event_kw["start_minute"], int(self.selenium.get_value("start_date_minute")))
        self.assertEqual(event_kw["end_minute"], int(self.selenium.get_value("stop_date_minute")))
        self.selenium.click("//a[@class='ui-dialog-titlebar-close ui-corner-all']")


if __name__ == "__main__":
    unittest.main()

