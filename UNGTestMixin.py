import unittest
from selenium import selenium
import urllib2
import os


ERP5_URL = "http://localhost:18080/erp5/"
ERP5_ACTIVITIES_URL = ERP5_URL + \
                        'portal_activities/getMessageList?include_processing=1'
UNG_URL = ERP5_URL + "web_site_module/ung/"


class UNGTestMixin(unittest.TestCase):
    """Base class for selenium UNG tests, containing useful methods."""
    def setUp(self):
        """set up instance environment"""
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*chrome", UNG_URL)
        self.selenium.start()

        #do default actions
        self.init()

    def init(self):
        """clear cache, open default page, login, wait for activities
        and then set default tree view as 'All Documents'"""
        self.selenium.open('')
        self.selenium.wait_for_page_to_load(30000)
        self.login_as_default_user()
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        #XXX all tests parsed may have
        # <tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/
        #                                         macros/delete-all-documents"/>
        # but it was omitted since it was not permited to delete objects

    def login_as_default_user(self):
        """login as default user 'test_user'"""
        #login to access home page -- equals to macros/login
        self.selenium.type("name", "test_user")
        self.selenium.type("password", "test_user")
        self.selenium.click("logged_in:method")
        self.selenium.wait_for_page_to_load("30000")

    def set_default_tree_view(self):
        """select default opened tree view as 'All Documents'"""
        self.wait_ung_listbox_to_load()
        if not self.selenium.is_element_present("//button[@class='tree-open']"):
            self.selenium.click("//table[@class='listbox-table-domain-tree']/tbody/tr[1]/td/button")
            self.selenium.wait_for_page_to_load("30000")
        elif not "All Documents" == self.selenium.get_text("//button[@class='tree-open']"):
            self.selenium.click("//table[@class='listbox-table-domain-tree']/tbody/tr[1]/td/button")
            self.selenium.wait_for_page_to_load("30000")

    def wait_ung_listbox_to_load(self, waiting_time="30000"):
        """wait until UNG listbox is fully loaded"""
        self.selenium.wait_for_condition("selenium.isElementPresent(\""
                               "//table[@class='listbox-table-domain-tree']\")",
                                        waiting_time)
        self.selenium.wait_for_condition("selenium.browserbot"
                ".getCurrentWindow().$('#knowledge_pad_module_ung_knowledge_pad"
                      "_ung_docs_listbox_content').css('opacity') == '1'",
                                        waiting_time)

    def wait_ung_calendar_to_load(self, waiting_time="30000"):
        """wait until UNG calendar is fully loaded"""
        self.selenium.wait_for_condition("selenium.browserbot"
            ".findElementOrNull('loadingpannel').style.display == 'none'",
                                         waiting_time)

    def wait_add_gadgets_dialog_to_load(self, waiting_time="30000"):
        """wait until UNG gadgets dialog is fully loaded"""
        self.selenium.wait_for_condition("selenium.browserbot"
                ".getCurrentWindow().$('div.gadget-listbox table#gadget-table')"
                ".children().length > 0",
                                         waiting_time)

    def clear_user_gadgets(self, user=None, password=None):
        """remove all gadgets from given user
        if no user is given, then just remove all gadgets"""
        if user:
            self.selenium.open("WebSite_logout")
            self.selenium.wait_for_page_to_load("30000")
            self.selenium.type("__ac_name", user)
            self.selenium.type("__ac_password", password)
            self.selenium.click("//input[@value='Login']")
            self.selenium.wait_for_page_to_load("30000")
            self.wait_ung_listbox_to_load()

        while self.selenium.is_element_present("//a[@class='clickable-block"
                                                             " block-remove']"):
            self.selenium.click("//a[@class=\"clickable-block block-remove\"]")
            self.selenium.get_confirmation()
            self.open_ung_default_page('ung')

    def clear_cache(self):
        """call method 'Base_clearCache' of bt5 erp5_ui_test, that orders
        portal_catalog to clear all allocated cache"""
        self.selenium.open("Base_clearCache")
        self.selenium.wait_for_page_to_load("30000")

    def wait_for_activities(self):
        """wait untill all activities end up, trying 60 times to see it,
        sleeping 2 seconds after each try"""
        activities = urllib2.urlopen(ERP5_ACTIVITIES_URL)
        for _try in range(60):
            message_queue = activities.readlines()
            if not message_queue:
                break
            #give time to selenium to recompose page when refresh
            unittest.time.sleep(2)

    def open_ung_default_page(self, page='ung', clear_cache=0, wait_for_activities=0):
        """open ung default page
            page = UNG page to be opened, default to UNG Docs
            clear_cache = if enabled, will call 'clear_cache'
            wait_for_activities = if enabled, will call 'wait_for_activities'"""
        if clear_cache:
            self.clear_cache()
        if wait_for_activities:
            self.wait_for_activities()
        self.selenium.open(page)
        self.selenium.wait_for_page_to_load("30000")
        if page == 'ung':
            self.wait_ung_listbox_to_load()
        elif page == "calendar":
            self.wait_ung_calendar_to_load()

    def get_file_path(self, filename):
        """returns the absolute path to a test file given a 'filename'"""
        return os.path.join(os.path.abspath(os.curdir), 'test_data', filename)

    def tearDown(self):
        """method called immediately after the test method has been called and
        the result recorded."""
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

    def create_document(self, portal_type, name=None, keywords=None):
        """create web documents, given a portal_type, optionally changing
        properties:
            name = name of the document
            keywords = keyword_list of the document
        """
        self.selenium.open("ERP5Site_createNewWebDocument?template=web_%s_template" % portal_type)
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.click("//a[@name=\"document_title\"]")
        if name:
            self.selenium.type("//input[@id=\"name\"]", name)
        if keywords:
            self.selenium.type("//textarea[@id=\"keyword_list\"]", keywords)
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_for_activities()
        return self.selenium.get_eval('selenium.browserbot.getCurrentWindow().location').split('?')[0]

    def create_calendar_event(self, event_type, name, start_month=None,
                                end_month=None, start_day=None, end_day=None,
                                start_year=None, end_year=None,
                                start_hour=None, end_hour=None,
                                start_minute=None, end_minute=None,
                                do_refresh=True):
        """Create an event at UNG Calendar.
        Requires that the UNG Calendar is open."""
        self.selenium.click("//span[@class=\"addcal\"]")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"portal_type\")", "10000")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.select("//select[@name=\"portal_type\"]", event_type)
        self.selenium.type("//input[@name=\"title\"]", name)

        if start_month:
            self.selenium.type("start_date_month", start_month)
            if end_month:
                self.selenium.type("stop_date_month", end_month)
            else:
                self.selenium.type("stop_date_month", start_month)
        if start_day:
            self.selenium.type("start_date_day", start_day)
            if end_day:
                self.selenium.type("stop_date_day", end_day)
            else:
                self.selenium.type("stop_date_day", start_day)
        if start_year:
            self.selenium.type("start_date_year", start_year)
            if end_year:
                self.selenium.type("stop_date_year", end_year)
            else:
                self.selenium.type("stop_date_year", start_year)

        if not start_hour:
            start_hour = unittest.time.localtime().tm_hour + 1
        if not end_hour:
            end_hour = unittest.time.localtime().tm_hour + 1
        self.selenium.type("start_date_hour", start_hour)
        self.selenium.type("stop_date_hour", end_hour)

        if start_minute:
            self.selenium.type("start_date_minute", start_minute)
            if end_minute:
                self.selenium.type("stop_date_minute", end_minute)
            else:
                self.selenium.type("stop_date_minute", start_minute)

        self.selenium.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        self.wait_for_activities()

        if do_refresh:
            #XXX due to interface delay
            #refresh interface 10 times
            for _try in range(10):
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                if self.selenium.is_text_present(name):
                    break
                else:
                    unittest.time.sleep(2)


if __name__ == "__main__":
    unittest.main()

