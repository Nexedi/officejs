from UNGTestMixin import UNGTestMixin
import unittest

class TestUNGDocsTextEditor(UNGTestMixin):
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

    def test_upload_text_with_image(self):
        """test that uploading a Text Document (Open Office) with an image, as a
        Web Page, will have its text and image correctly showed on fck editor"""
        test_time = int(unittest.time.time())
        test_file_path = self.get_file_path("ung-UNGDocs.Sample.TextWithImage.Text-001-en.odt")
        web_page_name = "Functional UNG Test %d - Uploaded Web Page With Image" % test_time
        #upload document
        self.selenium.click("//input[@id=\"upload\"]")
        self.selenium.select("//select[@name=\"portal_type\"]", "Web Page")
        self.selenium.click("//input[@id=\"submit_document\"]")
        self.selenium.type("//input[@id=\"upload-file\"]", test_file_path)
        self.selenium.click("//input[@id=\"submit_document\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.wait_for_condition("selenium.isTextPresent(\"Opening\")", "30000")
        self.selenium.wait_for_page_to_load("30000")
        #XXX this requires enabling a System Preference with Cloudooo
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//a[@name='document_title']\")", "30000")
        #save document
        self.selenium.click("//button[@name='Base_edit:method']")
        self.selenium.wait_for_page_to_load("30000")
        #assert web_page title
        self.failUnless(self.selenium.is_text_present("UNGDocs Text"))
        web_page_content = self.selenium.get_eval("window.document.getElementById('field_my_text_content').value")
        #assert text content is present
        self.failUnless('<b>Functional UNG Test</b>' in web_page_content)
        self.failUnless('<p style="margin-bottom: 0in; font-weight: normal;">'
            'Sample text document created in order to test some UNG features.'
            '</p>' in web_page_content)
        #assert image content is present
        self.failUnless('<img align="LEFT" width="122" height="30" border="0"'
            ' name="ung_docs-logo" src="image_module/' in web_page_content)


if __name__ == "__main__":
    unittest.main()

