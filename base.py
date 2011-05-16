from selenium import selenium
import unittest

import urllib2
from time import sleep
import os

ERP5_URL = "http://localhost:18080/erp5/"
UNG_URL = ERP5_URL + "web_site_module/ung/"

class BaseUNGTest(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*chrome", UNG_URL)
        self.selenium.start()

    #XXX all tests parsed may have
    # <tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/delete-all-documents"/>
    # but it was omitted since it's not permited to delete objects

    def init(self):
        sel = self.selenium
        sel.open("")
        sel.wait_for_page_to_load(30000)

    def login_as_default_user(self):
        sel = self.selenium
        #open default page  -- equals to macros/init since user is already created
        sel.open("")
        sel.wait_for_page_to_load('30000')
        #login to access home page -- equals to macros/login
        sel.type("name", "test_user")
        sel.type("password", "test_user")
        sel.click("logged_in:method")
        sel.wait_for_page_to_load("30000")

    def clear_cache(self):
        sel = self.selenium
        sel.open("Base_clearCache")
        sel.wait_for_page_to_load("30000")

    def wait_for_activities(self):
        activities = urllib2.urlopen(ERP5_URL + 'portal_activities/getMessageList')
        for _try in range(60):
            #XXX 'readlines' is proxyfied, so url is opened everytime it's called
            message_queue = activities.readlines()
            if not message_queue:
                break
        sleep(2) #XXX give time to selenium to recompose page when refresh

    def go_home(self, clear_cache=0, wait_for_activities=0):
        sel = self.selenium
        if clear_cache:
            self.clear_cache()
        if wait_for_activities:
            self.wait_for_activities()
        sel.open("")
        sel.wait_for_page_to_load("30000")

    def set_default_tree_view(self):
        sel = self.selenium
        try:
            if not "All Documents" == sel.get_text("//button[@class=\"tree-open\"]"):
                sel.click("//table[@class='your_listbox-table-domain-tree']/tbody/tr[1]/td/button")
                sel.wait_for_page_to_load("30000")
        except:
            sel.click("//table[@class='your_listbox-table-domain-tree']/tbody/tr[1]/td/button")
            sel.wait_for_page_to_load("30000")

    def get_test_file_path(self, filename):
        return os.path.join(os.path.abspath(os.curdir), 'test_data', filename)

    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()

