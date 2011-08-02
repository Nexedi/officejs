from UNGTestMixin import UNGTestMixin
import unittest

import re


class TestUNGGadgets(UNGTestMixin):
    """tests related to gadgets on UNG"""
    def test_add_and_delete_gadget(self):
        """test:
            - default gadget message is show when no gadgets are present
            - add gadget
            - delete gadget
        """
        self.failUnless(self.selenium.is_text_present("Please use link (Add gadgets) to prepare it yourself."))
        self.assertEqual("Add gadgets", self.selenium.get_text("//a[@id=\"add-gadgets\"]/span"))
        self.failIf(self.selenium.is_text_present("Join ERP5 Network !"))
        self.failIf(self.selenium.is_element_present("//a[@class=\"clickable-block block-remove\"]"))
        self.selenium.click("//a[@id=\"add-gadgets\"]")
        self.failUnless(self.selenium.is_text_present("Add Gadget"))
        self.selenium.click("//input[@id=\"erp5_documentation\"]")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        self.selenium.wait_for_page_to_load("30000")
        self.failUnless(self.selenium.is_text_present("Join ERP5 Network !"))
        self.failUnless(self.selenium.is_element_present("//a[@class=\"clickable-block block-remove\"]"))
        self.failIf(self.selenium.is_element_present("//div[@id=\"page_wrapper\"]/div[1]/h4"))
        self.selenium.click("//a[@class=\"clickable-block block-remove\"]")
        self.failUnless(re.search(r"^Are you sure you want to remove this gadget from your personalized page[\s\S]$", self.selenium.get_confirmation()))
        self.wait_for_activities()
        self.selenium.open("")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Add gadgets", self.selenium.get_text("//a[@id=\"add-gadgets\"]/span"))
        self.selenium.click("//a[@id=\"add-gadgets\"]")
        self.selenium.click("//input[@id=\"erp5_rss\"]")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Feed Reader", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.selenium.click("//a[@class=\"clickable-block block-remove\"]")
        self.failUnless(re.search(r"^Are you sure you want to remove this gadget from your personalized page[\s\S]$", self.selenium.get_confirmation()))
        self.wait_for_activities()
        self.selenium.open("")
        self.selenium.wait_for_page_to_load("30000")
        self.failIf(self.selenium.is_element_present("//a[@class=\"clickable-block block-remove\"]"))

    def test_add_two_gadgets(self):
        """test that its possible to add more than just 1 gadget"""
        self.selenium.click("//a[@id=\"add-gadgets\"]")
        self.selenium.click("//input[@id=\"erp5_documentation\"]")
        self.selenium.click("//input[@id=\"erp5_rss\"]")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Feed Reader", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.failUnless(self.selenium.is_text_present("Join ERP5 Network !"))
        self.selenium.click("//div[@id=\"portal-column-0\"]/div[1]/h3/span/a[@title=\"Remove\"]")
        self.failUnless(re.search(r"^Are you sure you want to remove this gadget from your personalized page[\s\S]$", self.selenium.get_confirmation()))
        self.wait_for_activities()
        self.selenium.open("")
        self.selenium.wait_for_page_to_load("30000")
        self.failIf(self.selenium.is_element_present("//div[@id=\"portal-column-0\"]/div[2]/h3/span/a[@title=\"Remove\"]"))
        self.failUnless(self.selenium.is_text_present("Join ERP5 Network !"))
        self.selenium.click("//a[@class=\"clickable-block block-remove\"]")
        self.failUnless(re.search(r"^Are you sure you want to remove this gadget from your personalized page[\s\S]$", self.selenium.get_confirmation()))
        self.wait_for_activities()
        self.selenium.open("?reset:int=1")
        self.selenium.wait_for_page_to_load("30000")
        self.failIf(self.selenium.is_element_present("//a[@class=\"clickable-block block-remove\"]"))

    def test_add_gadget_on_different_users(self):
        """test that different users have different gadgets"""
        self.selenium.click("//a[@id=\"add-gadgets\"]")
        self.selenium.click("//input[@id=\"erp5_documentation\"]")
        self.selenium.click("//input[@id=\"erp5_rss\"]")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_for_activities()
        self.selenium.open("WebSite_logout")
        self.selenium.wait_for_page_to_load("30000")
        #XXX user already created
#        self.selenium.click("//td[@id=\"new-account-form\"]")
#        self.selenium.type("//input[@name=\"firstname\"]", "Another")
#        self.selenium.type("//input[@name=\"lastname\"]", "User")
#        self.selenium.type("//input[@name=\"email\"]", "example2@example.com")
#        self.selenium.type("//input[@name=\"login_name\"]", "ung_user2")
#        self.selenium.type("//input[@name=\"password\"]", "1234")
#        self.selenium.type("//input[@name=\"confirm\"]", "1234")
#        self.selenium.click("//input[@value=\"Create Account\"]")
#        self.selenium.wait_for_page_to_load("30000")
        self.selenium.type("__ac_name", "ung_user2")
        self.selenium.type("__ac_password", "1234")
        self.selenium.click("//input[@type=\"submit\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.failUnless(self.selenium.is_text_present("Please use link (Add gadgets) to prepare it yourself."))
        self.failIf(self.selenium.is_text_present("Join ERP5 Network !"))
        self.selenium.click("//a[@id=\"add-gadgets\"]")
        self.selenium.click("//input[@id=\"erp5_worklists\"]")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("ERP5 Worklists", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.selenium.open("WebSite_logout")
        self.selenium.wait_for_page_to_load("30000")
        self.login_as_default_user()
        self.assertNotEqual("ERP5 Worklists", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.assertEqual("Feed Reader", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.failUnless(self.selenium.is_text_present("Join ERP5 Network !"))
        self.selenium.open("WebSite_logout")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.type("__ac_name", "zope")
        self.selenium.type("__ac_password", "zope")
        self.selenium.click("//input[@type=\"submit\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.failUnless(self.selenium.is_text_present("Please use link (Add gadgets) to prepare it yourself."))
        self.selenium.click("//a[@id=\"add-gadgets\"]")
        self.selenium.click("//input[@id=\"erp5_worklists\"]")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("ERP5 Worklists", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.selenium.click("//a[@class=\"clickable-block block-remove\"]")
        self.failUnless(re.search(r"^Are you sure you want to remove this gadget from your personalized page[\s\S]$", self.selenium.get_confirmation()))
        self.wait_for_activities()
        self.selenium.open("WebSite_logout")
        self.selenium.wait_for_page_to_load("30000")
        self.login_as_default_user()
        self.assertNotEqual("ERP5 Worklists", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.assertEqual("Feed Reader", self.selenium.get_text("//span[@class=\"gadget_title\"]"))
        self.failUnless(self.selenium.is_text_present("Join ERP5 Network !"))

    #XXX clean gadgets from all users after test
    # maybe using KnowledgePad tool
    # url: http://localhost:18080/erp5/portal_skins/erp5_web_ung_theme/WebSection_viewMenuWidget/pt_editForm
    # starting at <div class="front_pad">

if __name__ == "__main__":
    unittest.main()

