from base import BaseUNGTest
import unittest

class SimpleTestUng(BaseUNGTest):
    def test_simple_test_ung(self):
        sel = self.selenium
        #login
        self.login_as_default_user()
        #default view
        self.set_default_tree_view()
        #configure settings
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        sel.check("//input[@value=\'fck_editor\']")
        sel.check("//input[@value=\'text/html\']")
        sel.click("//html/body/div[3]/div[11]/div/button[1]")
        sel.wait_for_page_to_load(5000)
        #create new Web Page
        sel.click("//div[@id='wrapper_main']/div[1]/fieldset/div/div/div/div/div/div[1]/li/ul/li[3]/a/span")
        sel.wait_for_page_to_load("30000")
        #type text on FCK Editor
        sel.select_frame("//td[@id='xEditingArea']/iframe")
        sel.type("//body", "<p>hello there</p>")
        sel.select_window("null")
        #save Web Page
        sel.click("//button[@name='Base_edit:method']")
        sel.wait_for_page_to_load("30000")
        #assert text was typed
        self.assertEqual("<p>hello there</p>", sel.get_eval("window.document.getElementById('field_my_text_content').value"))
        #go back to home page
        sel.click("//div[@id='wrapper_header']/div[1]/fieldset/div/div/div/a[1]/img")
        sel.wait_for_page_to_load("30000")
        #go back to the created Web Page (the last one modified on the list)
        sel.click("//tr[@class='your_listbox-data-line-0 DataA']/td[3]/a")
        sel.wait_for_page_to_load("30000")
        #assert text was saved
        sel.wait_for_condition("selenium.browserbot.getCurrentWindow().document.getElementById('field_my_text_content')", "5000")
        self.assertEqual("<p>hello there</p>", sel.get_eval("window.document.getElementById('field_my_text_content').value"))
        sel.select_window("null")

if __name__ == "__main__":
    unittest.main()

