from base import BaseUNGTest
import unittest

class TestUNGDocsTextEditor(BaseUNGTest):
    """tests related to UNG Docs text editors"""
    def test_fill_content_on_web_page_with_fck_editor(self):
        """test the action of filling content on FCK Editor for a Web Page
        document"""
        #configure settings
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        self.selenium.check("//input[@value=\'fck_editor\']")
        self.selenium.check("//input[@value=\'text/html\']")
        self.selenium.click("//html/body/div[3]/div[11]/div/button[1]")
        self.selenium.wait_for_page_to_load(5000)
        #create new Web Page
        self.selenium.click("//div[@id='wrapper_main']/div[1]/fieldset/div/div/div/div/div/div[1]/li/ul/li[3]/a/span")
        self.selenium.wait_for_page_to_load("30000")
        #type text on FCK Editor
        self.selenium.select_frame("//td[@id='xEditingArea']/iframe")
        self.selenium.type("//body", "<p>hello there</p>")
        self.selenium.select_window("null")
        #save Web Page
        self.selenium.click("//button[@name='Base_edit:method']")
        self.selenium.wait_for_page_to_load("30000")
        #wait for activities
        self.wait_for_activities()
        #assert text was typed
        self.assertEqual("<p>hello there</p>", self.selenium.get_eval("window.document.getElementById('field_my_text_content').value"))
        #go back to home page
        self.selenium.click("//div[@id='wrapper_header']/div[1]/fieldset/div/div/div/a[1]/img")
        self.selenium.wait_for_page_to_load("30000")
        #go back to the created Web Page (the last one modified on the list)
        self.selenium.click("//tr[@class='your_listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        #assert text was saved
        self.selenium.wait_for_condition("selenium.browserbot.getCurrentWindow().document.getElementById('field_my_text_content')", "5000")
        self.assertEqual("<p>hello there</p>", self.selenium.get_eval("window.document.getElementById('field_my_text_content').value"))
        self.selenium.select_window("null")

if __name__ == "__main__":
    unittest.main()

