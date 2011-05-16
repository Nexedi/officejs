from base import BaseUNGTest
import unittest

import urllib2
from time import sleep

SVG_CONTENT = urllib2.quote("<svg width='640' height='480' xmlns='http://www.w3.org/2000/svg'> \
<g><title>Layer 1</title> \
<ellipse ry='46' rx='47' id='svg_1' cy='93' cx='138' stroke-width='5' stroke='#000000' fill='#FF0000'/> \
</g></svg>")

class TestUNGDocs(BaseUNGTest):
    def test_ung_docs(self):
        #XXX when gadgets are enabled, this test may fail
        # due to delay loading gadgets on every load of a page
        #XXX the action of rename a document, clicking on 'document-title'
        # may fail. I think, due to delay on animation when clicking to
        # rename the document, and then clicking it again
        # because selenium can do it really fast
        sel = self.selenium
        #XXX may slowing down the speed it may test pass every time it's runned
        #sel.set_speed(1000)
        #XXX even slowing down steps, the action of rename a document
        # still fails saving the new name, and the 'document-title' remains
        # showing the last one ('Web Page')

        self.init()
        self.login_as_default_user()
        #set default tree view as All Documents (tree opened or not)
        self.set_default_tree_view()

        sel.open("ERP5Site_createNewWebDocument?template=web_illustration_template")
        sel.wait_for_page_to_load("30000")
        url = sel.get_eval('selenium.browserbot.getCurrentWindow().location').split('?')[0]
        try:
            sel.set_timeout(1)
            sel.open(url + "/setTextContent?value=%s" % SVG_CONTENT)
        except:
            pass
        finally:
            sel.set_timeout(30000)
        sel.open(url + "/WebIllustration_viewEditor?editable_mode:int=1")
        sel.wait_for_page_to_load("30000")

        #XXX had to change
        #sel.wait_for_condition("selenium.isElementPresent(\"//ellipse[@id='svg_1']\")", "9000")
        sel.select_frame("//iframe[@id='svgframe']")
        sel.wait_for_condition("window.document.getElementById('svg_1')", "1000")
        self.assertEqual("46", sel.get_eval("window.document.getElementById('svg_1').ry.baseVal.value"))
        sel.select_window('null')

        self.assertEqual("Web Illustration", sel.get_text("//a[@name=\"document_title\"]"))
        self.assertEqual("Draft", sel.get_text("//a[@name=\"document_state\"]"))
        sel.click("//a[@name=\"document_title\"]")
        sleep(2)
        self.assertEqual("Rename Document", sel.get_text("//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Edit More Properties", sel.get_text("//p[@id=\"more_properties\"]"))
        sel.click("//p[@id=\"more_properties\"]")
        sleep(2)
        #XXX the "popup" is not complete handled when selenium closes window
        #so, needs to wait window to complete close before openning it again
        #maybe its a BUG
        sel.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        sleep(2)
        sel.click("//a[@name=\"document_title\"]")
        sleep(2)
        sel.type("//input[@id=\"name\"]", "Functional UNG Test")
        #XXX same behaviour as before, maybe it's also a bug
        sel.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/span")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test", sel.get_text("//a[@name=\"document_title\"]"))
        self.failIf(sel.is_text_present("All Documents"))
        sel.click("//a[@class=\"ung_docs\"]")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("All Documents", sel.get_text("//button[@class=\"tree-open\"]"))

        self.go_home(wait_for_activities=1)

        sel.type("//input[@name=\"field_your_search_text\"]", "Functional UNG Test")
        sel.click("//input[@value=\"Search Docs\"]")
        sel.wait_for_page_to_load("30000")
        self.failIf(sel.is_text_present("No result."))
        sel.open("ERP5Site_createNewWebDocument?template=web_table_template")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("Web Table", sel.get_text("//a[@name=\"document_title\"]"))
        self.failUnless(sel.is_element_present("//td[@id='0_table0_cell_c0_r1']"))
        self.failUnless(sel.is_element_present("//td[@id='0_table0_cell_c1_r1']"))
        self.assertEqual("Spreadsheet Playground", sel.get_text("//td[@id=\"jSheetTitle_0\"]"))
        self.assertEqual("MENU", sel.get_text("//td[@id=\"jSheetMenu_0\"]/span[@class=\"rootVoice\"]"))
        sel.run_script("$(\"#0_table0_cell_c0_r0\").html(\"Gabriel\")")
        sel.run_script("$(\"#0_table0_cell_c1_r1\").html(\"Monnerat\")")
        sel.click("//button[@class=\"save\"]")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("Gabriel", sel.get_text("//td[@id='0_table0_cell_c0_r0']"))
        self.assertEqual("Monnerat", sel.get_text("//td[@id='0_table0_cell_c1_r1']"))
        sel.open("ERP5Site_createNewWebDocument?template=web_page_template")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("Web Page", sel.get_text("//a[@name=\"document_title\"]"))
        sel.click("//div[@class=\"action_menu\"]/li/ul/li[1]/a")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("Cancelled", sel.get_text("//a[@name=\"document_state\"]"))
        sel.click("//a[@class=\"ung_docs\"]")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("All Documents", sel.get_text("//button[@class='tree-open']"))
        sel.click("//div[@class=\"favorite\"]/a[2]")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("All Documents", sel.get_text("//button[@class='tree-open']"))
        sel.click("//table[@class=\"listbox your_listbox your_listbox-table\"]/tbody/tr[1]/td[1]/input")

        sel.click("//button[@class=\"delete\"]")
        sel.wait_for_page_to_load("30000")
        self.go_home(clear_cache=1, wait_for_activities=1)

        sel.click("//table[@class=\"your_listbox-table-domain-tree\"]/tbody/tr[11]/td/button")
        sel.wait_for_page_to_load("30000")
        sel.set_timeout("30000")
        self.failIf(sel.is_text_present("No result."))
        self.assertEqual("Deleted", sel.get_text("//table/tbody/tr[1]/td[4]"))
        sel.click("//input[@title='Check All']")
        sel.click("//button[@class=\"delete\"]")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("No result.", sel.get_text("//td[@class=\"listbox-table-no-result-row\"]/span"))
        self.assertEqual("Trash", sel.get_text("//button[@class='tree-open']"))
        sel.click("//table[@class=\"your_listbox-table-domain-tree\"]/tbody/tr[3]/td/button")
        sel.wait_for_page_to_load("30000")
        self.assertEqual("No result.", sel.get_text("//td[@class=\"listbox-table-no-result-row\"]/span"))
        self.assertEqual("Hidden", sel.get_text("//button[@class='tree-open']"))
        #  Test the abbreviation of the title
        sel.open("ERP5Site_createNewWebDocument?template=web_page_template")
        sel.wait_for_page_to_load("30000")
        sel.click("//a[@name=\"document_title\"]")
        sleep(2)
        sel.type("//input[@id=\"name\"]", "Add a Big Title to Test the abbreviation")
        sleep(1)
        sel.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/span")
        sel.wait_for_page_to_load("30000")
        sleep(1)
        self.assertEqual("Add a Big Title to Test the ab...", sel.get_text("//a[@name=\"document_title\"]"))
        sel.click("//a[@name=\"document_title\"]")
        sleep(2)
        self.assertEqual("Add a Big Title to Test the abbreviation", sel.get_value("//input[@id=\"name\"]"))
        sel.open("")
        sel.wait_for_page_to_load("30000")
        sel.click("//div[@id=\"select_language\"]/li/ul/li/span[@id=\"fr\"]")
        sel.wait_for_page_to_load("30000")
        self.failUnless(sel.is_text_present("Aide"))
        sel.click("//div[@id=\"select_language\"]/li/ul/li/span[@id=\"en\"]")
        sel.wait_for_page_to_load("30000")
        self.failUnless(sel.is_text_present("Help"))

        #XXX this is done because of a XXX note made below code of file uploads
        self.set_default_tree_view()

        #find path file
        test_file_path = self.get_test_file_path("tiolive-ERP5.Freedom.TioLive.Spreadsheet-001-en.ods")
        for index in range(2):
            sel.click("//a[@class=\"ung_docs\"]")
            sel.wait_for_page_to_load("30000")
            sel.click("//input[@id=\"upload\"]")
            sel.select("//select[@name=\"portal_type\"]", "Web Table")
            sel.click("//input[@id=\"submit_document\"]")
            self.assertEqual("Please input a file", sel.get_text("//span[@id='no-input-file']"))
            self.failUnless(sel.is_text_present("Loading..."))
            self.failUnless(sel.is_element_present("//input[@id=\"upload-file\"]"))
            sel.type("//input[@id=\"upload-file\"]", test_file_path)
            sel.click("//input[@id=\"submit_document\"]")
            sel.wait_for_page_to_load("30000")
            sel.wait_for_condition("selenium.isTextPresent(\"Opening\")", "30000")
            sel.wait_for_page_to_load("30000")
            #XXX needs to enable a System Preference with Cloudooo
            sel.wait_for_condition("selenium.isElementPresent(\"//a[@name='document_title']\")", "30000")
            self.failUnless(sel.is_text_present("TioLive Spreadsheet"))
            self.assertEqual("1", sel.get_attribute("//td[@id='0_table0_cell_c0_r1']@sdval"))
            self.assertEqual("2", sel.get_attribute("//td[@id='0_table0_cell_c1_r1']@sdval"))

        sel.click("//a[@class=\"ung_docs\"]")
        sel.wait_for_page_to_load("30000")
        sel.click("//input[@id=\"upload\"]")
        sel.select("//select[@name=\"portal_type\"]", "Web Page")
        sel.type("//input[@id=\"upload-file\"]", test_file_path)
        sel.click("//input[@id=\"submit_document\"]")
        sel.wait_for_page_to_load("30000")
        sel.wait_for_condition("selenium.isTextPresent(\"Opening\")", "30000")
        sel.wait_for_page_to_load("30000")
        sel.wait_for_condition("selenium.isElementPresent(\"//a[@name='document_title']\")", "30000")
        self.failUnless(sel.is_text_present("TioLive Spreadsheet"))
        sel.click("//a[@class=\"ung_docs\"]")
        sel.wait_for_page_to_load("30000")
        sel.open("ERP5Site_createNewWebDocument?template=web_page_template")
        sel.wait_for_page_to_load("30000")
        sel.click("//a[@name=\"document_title\"]")
        sleep(2)
        sel.type("//input[@id=\"name\"]", "Cancelled Document")
        sel.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/span")
        sel.wait_for_page_to_load("30000")
        sleep(1)
        sel.click("//div[@class=\"action_menu\"]/li/ul/li[1]/a")
        sel.wait_for_page_to_load("30000")
        sel.click("//a[@class=\"ung_docs\"]")
        sel.wait_for_page_to_load("30000")
        #XXX needs to click 'All Documents' tree again -- selecting it before
        #uploading the first file
        sel.click("//table[@class=\"listbox your_listbox your_listbox-table\"]/tbody/tr[1]/td[1]/input")
        sel.click("//button[@class=\"delete\"]")
        sel.wait_for_page_to_load("30000")
        self.go_home(wait_for_activities=1)
        sel.click("//table[@class=\"your_listbox-table-domain-tree\"]/tbody/tr[11]/td/button") #Trash
        sel.wait_for_page_to_load("30000")
        self.assertEqual("Cancelled Document", sel.get_text("//table/tbody/tr[1]/td[3]"))
        sel.click("//table[@class=\"listbox your_listbox your_listbox-table\"]/tbody/tr[1]/td[1]/input")
        sel.click("//button[@class=\"delete\"]")
        sel.wait_for_page_to_load("30000")


if __name__ == "__main__":
    unittest.main()

