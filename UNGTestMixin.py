from selenium import selenium
import unittest

import urllib2
import os

ERP5_URL = "http://localhost:18080/erp5/"
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
        self.clear_cache()
        self.open_ung_default_page()
        self.login_as_default_user()
        self.wait_for_activities()
        self.set_default_tree_view()
        #XXX all tests parsed may have
        # <tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/delete-all-documents"/>
        # but it was omitted since it's not permited to delete objects

    def login_as_default_user(self):
        """login as default user 'test_user'"""
        #login to access home page -- equals to macros/login
        self.selenium.type("name", "test_user")
        self.selenium.type("password", "test_user")
        self.selenium.click("logged_in:method")
        self.selenium.wait_for_page_to_load("30000")

    def set_default_tree_view(self):
        """select default opened tree view as 'All Documents'"""
        try:
            if not "All Documents" == self.selenium.get_text("//button[@class=\"tree-open\"]"):
                self.selenium.click("//table[@class='your_listbox-table-domain-tree']/tbody/tr[1]/td/button")
                self.selenium.wait_for_page_to_load("30000")
        except:
            self.selenium.click("//table[@class='your_listbox-table-domain-tree']/tbody/tr[1]/td/button")
            self.selenium.wait_for_page_to_load("30000")

    def clear_cache(self):
        """call method 'Base_clearCache' of bt5 erp5_ui_test, that orders
        portal_catalog to clear all allocated cache"""
        self.selenium.open("Base_clearCache")
        self.selenium.wait_for_page_to_load("30000")

    def wait_for_activities(self):
        """wait untill all activities end up, trying 60 times to see it,
        sleeping 2 seconds after each try"""
        activities = urllib2.urlopen(ERP5_URL + 'portal_activities/getMessageList')
        for _try in range(60):
            #XXX 'readlines' is proxyfied, so url is opened everytime it's called
            message_queue = activities.readlines()
            if not message_queue:
                break
            unittest.time.sleep(2) #XXX give time to selenium to recompose page when refresh

    def open_ung_default_page(self, page="", clear_cache=0, wait_for_activities=0):
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
        if page == "calendar":
            self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");

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

    def create_calendar_event(self, event_type, name):
        self.selenium.click("//span[@class=\"addcal\"]")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"portal_type\")", "10000")
        self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
        self.selenium.select("//select[@name=\"portal_type\"]", event_type)
        self.selenium.type("//input[@name=\"title\"]", name)
        self.selenium.type("//input[@name=\"start_date_hour\"]", unittest.time.localtime().tm_hour + 1)
        self.selenium.type("//input[@name=\"stop_date_hour\"]", unittest.time.localtime().tm_hour + 1)
        self.selenium.click("//div[@aria-labelledby='ui-dialog-title-new_event_dialog']//button")
        self.wait_for_activities()
        #XXX due to interface delay
        #try 5 times to see new event under interface
        for _try in range(5):
            try:
                self.selenium.click("//div/span[@title='Refresh view']")
                self.selenium.wait_for_condition("selenium.browserbot.findElementOrNull('loadingpannel').style.display == 'none'", "10000");
                self.failUnless(self.selenium.is_text_present(name))
                if self.selenium.is_text_present(name):
                    break
            except:
                pass


if __name__ == "__main__":
    unittest.main()

