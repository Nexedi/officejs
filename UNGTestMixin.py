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

    def open_ung_default_page(self, clear_cache=0, wait_for_activities=0):
        """open ung default page set under 'setUp'
            clear_cache = if enabled, will call 'clear_cache'
            wait_for_activities = if enabled, will call 'wait_for_activities'"""
        if clear_cache:
            self.clear_cache()
        if wait_for_activities:
            self.wait_for_activities()
        self.selenium.open("")
        self.selenium.wait_for_page_to_load("30000")

    def get_test_file_path(self, filename):
        """returns the absolute path to a test file given a 'filename'"""
        return os.path.join(os.path.abspath(os.curdir), 'test_data', filename)

    def tearDown(self):
        """method called immediately after the test method has been called and
        the result recorded."""
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)


if __name__ == "__main__":
    unittest.main()

