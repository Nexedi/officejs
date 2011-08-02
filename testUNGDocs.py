from UNGTestMixin import UNGTestMixin
import unittest

import urllib2

SVG_CONTENT = urllib2.quote("<svg width='640' height='480' \
xmlns='http://www.w3.org/2000/svg'> \
<g><title>Layer 1</title> \
<ellipse ry='46' rx='47' id='svg_1' cy='93' cx='138' stroke-width='5' \
stroke='#000000' fill='#FF0000'/> </g></svg>")


class TestUNGDocs(UNGTestMixin):
    """Tests related to UNG Docs"""

    def test_web_illustration(self):
        """test add, fill, rename and search for a Web Illustration document"""
        url = self.create_document('illustration')
        try:
            self.selenium.set_timeout(1)
            self.selenium.open(url + "/setTextContent?value=%s" % SVG_CONTENT)
        except:
            pass
        finally:
            self.selenium.set_timeout(30000)
        self.selenium.open(url + "/WebIllustration_viewEditor?"
                                                          "editable_mode:int=1")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.select_frame("//iframe[@id='svgframe']")
        self.selenium.wait_for_condition("window.document.getElementById"
                                                            "('svg_1')", "1000")
        self.assertEqual("46", self.selenium.get_eval("window.document."
                                    "getElementById('svg_1').ry.baseVal.value"))
        self.selenium.select_window('null')

        self.assertEqual("Web Illustration", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Draft", self.selenium.get_text(
                                               "//a[@name=\"document_state\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Edit More Properties",
                        self.selenium.get_text("//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.selenium.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        self.selenium.click("//a[@name=\"document_title\"]")
        self.selenium.type("//input[@id=\"name\"]", "Functional UNG Test")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]"
                                                              "/button[1]/span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.failIf(self.selenium.is_text_present("All Documents"))
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("All Documents", self.selenium.get_text(
                                              "//button[@class=\"tree-open\"]"))

        self.selenium.type("//input[@name=\"field_your_search_text\"]",
                            "Functional UNG Test")
        self.selenium.click("//input[@value=\"Search Docs\"]")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))

    def test_web_page(self):
        """test the action of add, cancel, delete and then delete again a
        Web Page document"""
        self.create_document('page')
        self.assertEqual("Web Page", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.selenium.click("//div[@class=\"action_menu\"]/li/ul/li[1]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Cancelled", self.selenium.get_text(
                                               "//a[@name=\"document_state\"]"))
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("All Documents", self.selenium.get_text(
                                                "//button[@class='tree-open']"))
        self.selenium.click("//div[@class=\"favorite\"]/a[2]")  # Refresh
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual("All Documents", self.selenium.get_text(
                                                "//button[@class='tree-open']"))
        self.selenium.click("//table[@class=\"listbox listbox listbox-table\"]"
                                                     "/tbody/tr[1]/td[1]/input")
        self.selenium.click("//button[@class='delete']")
        self.selenium.wait_for_page_to_load("30000")
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.selenium.click("//button[@value='ung_domain/trash.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))
        self.assertEqual("Deleted", self.selenium.get_text("//table/tbody/"
                                                                "tr[1]/td[4]"))
        self.selenium.click("//input[@title='Check All']")
        self.selenium.click("//button[@class='delete']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual("No result.", self.selenium.get_text(
                           "//td[@class='listbox-table-no-result-row']/span"))
        self.assertEqual("Trash", self.selenium.get_text(
                                                "//button[@class='tree-open']"))
        self.selenium.click("//button[@value='ung_domain/hidden.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("No result.", self.selenium.get_text(
                          "//td[@class=\"listbox-table-no-result-row\"]/span"))
        self.assertEqual("Hidden", self.selenium.get_text(
                                                "//button[@class='tree-open']"))

    def test_title_abbreviation(self):
        """test the abbreviation of a long title of the document"""
        self.create_document('page')
        self.selenium.click("//a[@name=\"document_title\"]")
        self.selenium.type("//input[@id=\"name\"]",
                            "Add a Big Title to Test the abbreviation")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/"
                                                                         "span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Add a Big Title to Test the ab...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Add a Big Title to Test the abbreviation",
                              self.selenium.get_value("//input[@id=\"name\"]"))

    def test_help_button_translation(self):
        """test that help button is translated"""
        self.open_ung_default_page('ung')
        self.selenium.click("//div[@id=\"select_language\"]/li/ul/li/"
                                                             "span[@id=\"fr\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.failUnless(self.selenium.is_text_present("Aide"))
        self.selenium.click("//div[@id=\"select_language\"]/li/ul/li/"
                                                             "span[@id=\"en\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.failUnless(self.selenium.is_text_present("Help"))

    def test_web_table_upload_twice(self):
        """test the twice upload of a spreadsheet file into a Web Table
        document."""
        test_file_path = self.get_file_path(
                          "tiolive-ERP5.Freedom.TioLive.Spreadsheet-001-en.ods")
        for index in range(2):
            self.selenium.click("//a[@class=\"ung_docs\"]")
            self.selenium.wait_for_page_to_load("30000")
            self.selenium.click("//input[@id=\"upload\"]")
            self.selenium.select("//select[@name=\"portal_type\"]",
                                  "Web Table")
            self.selenium.click("//input[@id=\"submit_document\"]")
            self.assertEqual("Please input a file", self.selenium.get_text(
                                                 "//span[@id='no-input-file']"))
            self.failUnless(self.selenium.is_text_present("Loading..."))
            self.failUnless(self.selenium.is_element_present(
                                                "//input[@id=\"upload-file\"]"))
            self.selenium.type("//input[@id=\"upload-file\"]", test_file_path)
            self.selenium.click("//input[@id=\"submit_document\"]")
            self.selenium.wait_for_page_to_load("30000")
            self.selenium.wait_for_condition("selenium.isTextPresent("
                                                        "\"Opening\")", "30000")
            self.selenium.wait_for_page_to_load("30000")
            #XXX this requires enabling a System Preference with Cloudooo
            self.selenium.wait_for_condition("selenium.isElementPresent("
                                    "\"//a[@name='document_title']\")", "30000")
            self.failUnless(self.selenium.is_text_present(
                                                        "TioLive Spreadsheet"))
            self.assertEqual("1", self.selenium.get_attribute(
                                       "//td[@id='0_table0_cell_c0_r1']@sdval"))
            self.assertEqual("2", self.selenium.get_attribute(
                                       "//td[@id='0_table0_cell_c1_r1']@sdval"))

    def test_web_table_upload_converting_to_web_page(self):
        """test upload of a spreadsheet converting to a Web Page document"""
        test_file_path = self.get_file_path(
                          "tiolive-ERP5.Freedom.TioLive.Spreadsheet-001-en.ods")
        self.selenium.click("//a[@class=\"ung_docs\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.click("//input[@id=\"upload\"]")
        self.selenium.select("//select[@name=\"portal_type\"]", "Web Page")
        self.selenium.type("//input[@id=\"upload-file\"]", test_file_path)
        self.selenium.click("//input[@id=\"submit_document\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.wait_for_condition("selenium.isTextPresent(\"Opening\")",
                                          "30000")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.wait_for_condition("selenium.isElementPresent("
                                    "\"//a[@name='document_title']\")", "30000")
        self.failUnless(self.selenium.is_text_present("TioLive Spreadsheet"))

    def test_cancel_web_page(self):
        """test the action of cancelling a Web Page document"""
        self.create_document('page', name='Cancelled Document')
        self.selenium.click("//a[contains(./@href, 'cancel_action')]")
        self.selenium.wait_for_page_to_load("30000")
        self.open_ung_default_page('ung')
        #XXX needs to click 'All Documents' tree again -- selecting it before
        #uploading the first file
        self.selenium.click("//table[@class=\"listbox listbox listbox-table\"]"
                                                    "/tbody/tr[1]/td[1]/input")
        self.selenium.click("//button[@class='delete']")
        self.selenium.wait_for_page_to_load("30000")
        self.open_ung_default_page(wait_for_activities=1)
        self.wait_ung_listbox_to_load()
        self.selenium.click("//button[@value='ung_domain/trash.0']")  # Trash
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual("Cancelled Document", self.selenium.get_text(
                                                   "//table/tbody/tr[1]/td[3]"))
        self.selenium.click("//table[@class=\"listbox listbox listbox-table\"]"
                                                     "/tbody/tr[1]/td[1]/input")
        self.selenium.click("//button[@class='delete']")
        self.selenium.wait_for_page_to_load("30000")

    def test_change_title(self):
        """test the action of changing a title, by:
            - opening the window to change title, and closing it
            - opening again, changing values, but closing without saving
            - opening again, changing values, and saving
            - assert values are saved
            - rename values to others
            - assert new valures are saved
        for Web Illustration, Web Table and Web Page documents"""

        #New Web Illustration
        self.create_document('illustration')
        self.assertEqual("Web Illustration", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Draft", self.selenium.get_text(
                                               "//a[@name=\"document_state\"]"))
        #First just check properties
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Illustration", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Web Illustration", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        #Than check and fill properties, without saving
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Illustration", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Web Illustration", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Web Illustration")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Web Illustration")
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "002")
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "fr")
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "0")
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test\nUNG Test")
        self.selenium.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        #Than check and fill properties, saving
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Illustration", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Web Illustration", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Web Illustration")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Web Illustration")
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "002")
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "fr")
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "1")
        self.assertEqual("",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test\nUNG Test")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/"
                                                                         "span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Illu...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.refresh()
        self.assertEqual("Functional UNG Test - Web Illu...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        #Finally, verify
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("Functional UNG Test - Web Illustration",
                          self.selenium.get_text(
                              "//tr[@class='listbox-data-line-0 DataA']/td[3]"))
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Illu...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Web Illustration",
                                self.selenium.get_value("//input[@id='name']"))
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Web Illustration",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.assertEqual("002", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.assertEqual("fr", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.assertEqual("1", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.assertEqual("Functional UNG Test\nUNG Test",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.open_ung_default_page('ung')
        self.selenium.type("//input[@name=\"field_your_search_text\"]",
                            "\"Functional UNG Test - Web Illustration\"")
        self.selenium.click("//input[@value=\"Search Docs\"]")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))
        #Change to other
        self.open_ung_default_page('ung')
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Illu...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Web Illu...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.assertEqual("", self.selenium.get_text("//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Renamed Web "
                                                                 "Illustration")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Web Illustration",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Renamed Web "
                                                                 "Illustration")
        self.assertEqual("002", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "003")
        self.assertEqual("fr", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "en")
        self.assertEqual("1", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "2")
        self.assertEqual("Functional UNG Test\nUNG Test",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test Renamed\n"
                                                             "UNG Test Renamed")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/"
                                                                         "span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.refresh()
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        #Verify changes
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("Functional UNG Test - Renamed Web Illustration",
                          self.selenium.get_text(
                              "//tr[@class='listbox-data-line-0 DataA']/td[3]"))
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Renamed Web Illustration",
                                self.selenium.get_value("//input[@id='name']"))
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Renamed Web Illustration",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.assertEqual("003", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.assertEqual("2", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.assertEqual("Functional UNG Test Renamed\nUNG Test Renamed",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.selenium.type("//input[@name=\"field_your_search_text\"]",
                           "\"Functional UNG Test - Renamed Web Illustration\"")
        self.selenium.click("//input[@value=\"Search Docs\"]")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))

        #New Web Table
        self.create_document('table')
        self.assertEqual("Web Table", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Draft", self.selenium.get_text(
                                               "//a[@name=\"document_state\"]"))
        #First just see properties
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Table", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Web Table", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        #Than check and fill properties, without saving
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Table", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Web Table", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Web Table")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Web Table")
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "002")
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "fr")
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "0")
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test\nUNG Test")
        self.selenium.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        #Than check and fill properties, saving
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Table", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Web Table", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Web Table")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Web Table")
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "002")
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "fr")
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "1")
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test\nUNG Test")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/"
                                                                         "span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Tabl...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.refresh()
        self.assertEqual("Functional UNG Test - Web Tabl...",
                       self.selenium.get_text("//a[@name='document_title']"))
        #Finally, verify
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("Functional UNG Test - Web Table",
                      self.selenium.get_text(
                              "//tr[@class='listbox-data-line-0 DataA']/td[3]"))
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Tabl...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Web Table",
                                self.selenium.get_value("//input[@id='name']"))
        self.assertEqual("Edit More Properties",
                        self.selenium.get_text("//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Web Table",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.assertEqual("002", self.selenium.get_value("//input[@id='version']"))
        self.assertEqual("fr", self.selenium.get_value("//input[@id='language']"))
        self.assertEqual("1", self.selenium.get_value("//input[@id='sort_index']"))
        self.assertEqual("Functional UNG Test\nUNG Test",
                      self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.selenium.type("//input[@name=\"field_your_search_text\"]",
                            "\"Functional UNG Test - Web Table\"")
        self.selenium.click("//input[@value=\"Search Docs\"]")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))
        #Change to other
        self.open_ung_default_page('ung')
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Tabl...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Web Tabl...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.assertEqual("", self.selenium.get_text("//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Renamed Web Table")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Web Table",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Renamed Web Table")
        self.assertEqual("002", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "003")
        self.assertEqual("fr", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "en")
        self.assertEqual("1", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "2")
        self.assertEqual("Functional UNG Test\nUNG Test",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list",
                            "Functional UNG Test Renamed\nUNG Test Renamed")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/"
                                                                         "span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.refresh()
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        #Verify changes
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("Functional UNG Test - Renamed Web Table",
                          self.selenium.get_text(
                              "//tr[@class='listbox-data-line-0 DataA']/td[3]"))
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document",
                          self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Renamed Web Table",
                                self.selenium.get_value("//input[@id='name']"))
        self.assertEqual("Edit More Properties",
                        self.selenium.get_text("//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Renamed Web Table",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.assertEqual("003", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.assertEqual("2", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.assertEqual("Functional UNG Test Renamed\nUNG Test Renamed",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.selenium.type("//input[@name=\"field_your_search_text\"]",
                                  "\"Functional UNG Test - Renamed Web Table\"")
        self.selenium.click("//input[@value=\"Search Docs\"]")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))

        #New Web Page
        self.create_document('page')
        self.assertEqual("Web Page",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.assertEqual("Draft",
                       self.selenium.get_text("//a[@name=\"document_state\"]"))
        #First just see properties
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document",
                          self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Page",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.assertEqual("Edit More Properties",
                        self.selenium.get_text("//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Web Page", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        #Than check and fill properties, without saving
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Page", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Web Page", self.selenium.get_value("//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Web Page")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Web Page")
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "002")
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "fr")
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "0")
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test\nUNG Test")
        self.selenium.click("//span[@class=\"ui-icon ui-icon-closethick\"]")
        #Than check and fill properties, saving
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Web Page", self.selenium.get_text(
                                               "//a[@name=\"document_title\"]"))
        self.assertEqual("Web Page", self.selenium.get_value(
                                                         "//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Web Page")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("", self.selenium.get_value(
                                                  "//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Web Page")
        self.assertEqual("001", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "002")
        self.assertEqual("en", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "fr")
        self.assertEqual("", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "1")
        self.assertEqual("", self.selenium.get_value(
                                              "//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test\nUNG Test")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/"
                                                                         "span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Page",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.refresh()
        self.assertEqual("Functional UNG Test - Web Page",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        #Finally, verify
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("Functional UNG Test - Web Page",
                          self.selenium.get_text(
                              "//tr[@class='listbox-data-line-0 DataA']/td[3]"))
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Page",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document",
                          self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Web Page",
                                self.selenium.get_value("//input[@id='name']"))
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Web Page",
                          self.selenium.get_value("//input[@id='short_title']"))
        self.assertEqual("002", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.assertEqual("fr", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.assertEqual("1", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.assertEqual("Functional UNG Test\nUNG Test",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.selenium.type("//input[@name=\"field_your_search_text\"]",
                            "\"Functional UNG Test - Web Page\"")
        self.selenium.click("//input[@value=\"Search Docs\"]")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))
        #Change to other
        self.open_ung_default_page('ung')
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Web Page",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                              "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Web Page",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.assertEqual("", self.selenium.get_text("//input[@id='name']"))
        self.selenium.type("name", "Functional UNG Test - Renamed Web Page")
        self.assertEqual("Edit More Properties", self.selenium.get_text(
                                                "//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Web Page",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.selenium.type("short_title", "Func. UNG Test - Renamed Web Page")
        self.assertEqual("002", self.selenium.get_value(
                                                      "//input[@id='version']"))
        self.selenium.type("version", "003")
        self.assertEqual("fr", self.selenium.get_value(
                                                     "//input[@id='language']"))
        self.selenium.type("language", "en")
        self.assertEqual("1", self.selenium.get_value(
                                                   "//input[@id='sort_index']"))
        self.selenium.type("sort_index", "2")
        self.assertEqual("Functional UNG Test\nUNG Test",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.selenium.type("keyword_list", "Functional UNG Test Renamed\n"
                                                             "UNG Test Renamed")
        self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/span")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.refresh()
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        #Verify changes
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.assertEqual("Functional UNG Test - Renamed Web Page",
                         self.selenium.get_text(
                              "//tr[@class='listbox-data-line-0 DataA']/td[3]"))
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Functional UNG Test - Renamed ...",
                       self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.selenium.click("//a[@name=\"document_title\"]")
        self.assertEqual("Rename Document", self.selenium.get_text(
                               "//span[@id=\"ui-dialog-title-edit_document\"]"))
        self.assertEqual("Functional UNG Test - Renamed Web Page",
                                self.selenium.get_value("//input[@id='name']"))
        self.assertEqual("Edit More Properties",
                        self.selenium.get_text("//p[@id=\"more_properties\"]"))
        self.selenium.click("//p[@id=\"more_properties\"]")
        self.assertEqual("Func. UNG Test - Renamed Web Page",
                         self.selenium.get_value("//input[@id='short_title']"))
        self.assertEqual("003", self.selenium.get_value("//input[@id='version']"))
        self.assertEqual("en", self.selenium.get_value("//input[@id='language']"))
        self.assertEqual("2", self.selenium.get_value("//input[@id='sort_index']"))
        self.assertEqual("Functional UNG Test Renamed\nUNG Test Renamed",
                     self.selenium.get_value("//textarea[@id='keyword_list']"))
        self.open_ung_default_page('ung', wait_for_activities=1)
        self.selenium.type("//input[@name=\"field_your_search_text\"]",
                            "\"Functional UNG Test - Renamed Web Page\"")
        self.selenium.click("//input[@value=\"Search Docs\"]")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No result."))

    def test_subject_list(self):
        """test that:
            - when filtering 'By Subject', it shows correct documents
            - when changing old subjects to new ones, the old ones disappear on
                the list"""
        test_subject_time = int(unittest.time.time())
        self.create_document('page', keywords="UNG Test Subject %d" % \
                                                              test_subject_time)
        self.failUnless(self.selenium.is_element_present(
                  "//meta[@content='UNG Test Subject %d']" % test_subject_time))
        self.open_ung_default_page('ung', clear_cache=1, wait_for_activities=1)
        self.failIf(self.selenium.is_text_present(
                                     "Ung test subject %d" % test_subject_time))
        self.selenium.click("//button[@value='ung_domain/by_subject.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual("Ung test subject %d" % test_subject_time,
               self.selenium.get_text("//button[@value='ung_domain/by_subject/"
                         "subject_UNG Test Subject %d.1']" % test_subject_time))
        self.failUnless(self.selenium.is_element_present(
                        "//button[@value='ung_domain/by_subject/"
                         "subject_UNG Test Subject %d.1']" % test_subject_time))
        self.selenium.click("//tr[@class='listbox-data-line-0 DataA']/td[3]/a")
        self.selenium.wait_for_page_to_load('30000')
        self.rename_document(keywords="UNG Test VPN %(time)d\n"
                   "UNG Test Cloudooo %(time)d" % {'time': test_subject_time})
        self.open_ung_default_page('ung', clear_cache=1, wait_for_activities=1)
        self.selenium.click("//button[@value='ung_domain/by_subject.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        #check that when renaming subjects, the old ones are not present anymore
        self.failIf(self.selenium.is_element_present(
                              "//button[@value='ung_domain/by_subject/"
                              "subject_UNG Subject %d.1']" % test_subject_time))
        self.failUnless(self.selenium.is_element_present(
                             "//button[@value='ung_domain/by_subject/subject_UNG"
                                        " Test VPN %d.1']" % test_subject_time))
        self.assertEqual("Ung test vpn %d" % test_subject_time,
              self.selenium.get_text("//button[@value='ung_domain/by_subject/"
                             "subject_UNG Test VPN %d.1']" % test_subject_time))
        self.failUnless(self.selenium.is_element_present(
                        "//button[@value='ung_domain/by_subject/"
                        "subject_UNG Test Cloudooo %d.1']" % test_subject_time))
        self.assertEqual("Ung test cloudooo %d" % test_subject_time,
            self.selenium.get_text("//button[@value='ung_domain/by_subject/"
                        "subject_UNG Test Cloudooo %d.1']" % test_subject_time))

        self.create_document('table', keywords="UNG Test Web Table Subject %d"\
                                                            % test_subject_time)
        self.open_ung_default_page('ung', clear_cache=1, wait_for_activities=1)
        self.selenium.click("//button[@value='ung_domain/by_subject.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual("Ung test web table subject %d" % test_subject_time,
            self.selenium.get_text("//button[@value='ung_domain/by_subject/"
               "subject_UNG Test Web Table Subject %d.1']" % test_subject_time))
        self.selenium.click("//button[@value='ung_domain/by_subject/"
                "subject_UNG Test Web Table Subject %d.1']" % test_subject_time)
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.failUnless(self.selenium.is_element_present(
                    "//table[@class=\"listbox listbox listbox-table\"]/tbody"
                                                          "/tr[1]/td[1]/input"))
        self.failUnless(self.selenium.is_element_present(
                    "//table[@class=\"listbox listbox listbox-table\"]/tbody"
                                                          "/tr[1]/td[2]/input"))
        #assert only one element is present,
        #because only one 'table' element was created
        self.failIf(self.selenium.is_element_present(
                    "//table[@class=\"listbox listbox listbox-table\"]/tbody/"
                                                           "tr[2]/td[1]/input"))

    def test_all_domain_tree_filters(self):
        """test Domain Tree on UNG Docs.
        Domain Tree is the box where listbox is filtered by state, document
        type. All Cases should be tested, including collapse and expand items
        into the list."""
        test_time = int(unittest.time.time())
        #first, create a web illustration, a web page and a web table
        web_illustration_name = "Functional UNG Test %d - Web Illustration" \
                                                                     % test_time
        web_illustration_keywords = "Ung test %d - web illustration" % test_time
        web_illustration_url = self.create_document('illustration',
                                            name=web_illustration_name,
                                            keywords=web_illustration_keywords)

        web_page_name = "Functional UNG Test %d - Web Page" % test_time
        web_page_keywords = "Ung test %d - web page" % test_time
        web_page_url = self.create_document('page',
                                            name=web_page_name,
                                            keywords=web_page_keywords)

        web_table_name = "Functional UNG Test %d - Web Table" % test_time
        web_table_keywords = "Ung test %d - web table" % test_time
        web_table_url = self.create_document('table',
                                            name=web_table_name,
                                            keywords=web_table_keywords)

        #test 'All Documents' filter
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        self.failUnless(self.selenium.is_text_present(web_table_name))
        self.failUnless(self.selenium.is_text_present(web_page_name))
        self.failUnless(self.selenium.is_text_present(web_illustration_name))
        #test 'All Documents' / 'Web Illustration' filter
        self.assertEqual("Web Illustration", self.selenium.get_text(
                            "//button[@value='ung_domain/all_documents/"
                                                 "web_illustration_domain.1']"))
        self.selenium.click("//button[@value='ung_domain/all_documents/"
                                                  "web_illustration_domain.1']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual(web_illustration_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #test 'All Documents' / 'Web Page' filter
        self.assertEqual("Web Page", self.selenium.get_text(
            "//button[@value='ung_domain/all_documents/web_page_subdomain.1']"))
        self.selenium.click("//button[@value='ung_domain/all_documents/"
                                                       "web_page_subdomain.1']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual(web_page_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #test 'All Documents' / 'Web Table' filter
        self.assertEqual("Web Table", self.selenium.get_text(
                        "//button[@value='ung_domain/all_documents/"
                                                     "web_table_subdomain.1']"))
        self.selenium.click("//button[@value='ung_domain/all_documents/"
                                                      "web_table_subdomain.1']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual(web_table_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #test collapsing 'All Documents' and testing all 3 documents are present
        self.selenium.click("//button[@value='ung_domain/all_documents.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.failUnless(self.selenium.is_text_present(web_table_name))
        self.failUnless(self.selenium.is_text_present(web_page_name))
        self.failUnless(self.selenium.is_text_present(web_illustration_name))

        #test 'By Subject' filter
        self.open_ung_default_page(clear_cache=1)
        self.set_default_tree_view()
        self.selenium.click("//button[@value='ung_domain/by_subject.0']")
        self.selenium.wait_for_page_to_load('30000')
        self.wait_ung_listbox_to_load()
        self.failUnless(self.selenium.is_text_present(
                                                     web_illustration_keywords))
        self.failUnless(self.selenium.is_text_present(web_page_keywords))
        self.failUnless(self.selenium.is_text_present(web_table_keywords))
        #test 'By Subject' has web_illustration keywords
        self.assertEqual(web_illustration_keywords, self.selenium.get_text(
                    "//button[@value='ung_domain/by_subject/subject_%s.1']" % \
                                                     web_illustration_keywords))
        self.selenium.click("//button[@value='ung_domain/by_subject/"
                                   "subject_%s.1']" % web_illustration_keywords)
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual(web_illustration_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #test 'By Subject' has web_page keywords
        self.assertEqual(web_page_keywords, self.selenium.get_text(
                    "//button[@value='ung_domain/by_subject/subject_%s.1']" % \
                                                             web_page_keywords))
        self.selenium.click("//button[@value='ung_domain/by_subject/"
                                           "subject_%s.1']" % web_page_keywords)
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual(web_page_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #test 'By Subject' has web_table keywords
        self.assertEqual(web_table_keywords, self.selenium.get_text(
                    "//button[@value='ung_domain/by_subject/subject_%s.1']" % \
                                                            web_table_keywords))
        self.selenium.click("//button[@value='ung_domain/by_subject/"
                                          "subject_%s.1']" % web_table_keywords)
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual(web_table_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #test collapsing 'By Subject' and testing all 3 documents are present
        self.selenium.click("//button[@value='ung_domain/by_subject.0']")
        self.selenium.wait_for_page_to_load('30000')
        self.wait_ung_listbox_to_load()
        self.failUnless(self.selenium.is_text_present(web_illustration_name))
        self.failUnless(self.selenium.is_text_present(web_page_name))
        self.failUnless(self.selenium.is_text_present(web_table_name))

        #test 'Owner' filter
        self.open_ung_default_page(clear_cache=1)
        self.set_default_tree_view()
        self.selenium.click("//button[@value='ung_domain/owner.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        #for web_table
        self.assertEqual(web_table_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #for web_page
        self.assertEqual(web_page_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-1 DataB']/td[3]/a"))
        #for web_illustration
        self.assertEqual(web_illustration_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-2 DataA']/td[3]/a"))

        #test 'Recent' filter
        self.open_ung_default_page(clear_cache=1)
        self.set_default_tree_view()
        self.selenium.click("//button[@value='ung_domain/owner.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        #for web_table
        self.assertEqual(web_table_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-0 DataA']/td[3]/a"))
        #for web_page
        self.assertEqual(web_page_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-1 DataB']/td[3]/a"))
        #for web_illustration
        self.assertEqual(web_illustration_name, self.selenium.get_text(
                            "//tr[@class='listbox-data-line-2 DataA']/td[3]/a"))

        #test 'Shared by me' filter
        #share web_illustration
        self.selenium.open(web_illustration_url)
        self.selenium.click("//a[@id=\"share_document\"]")
        self.selenium.wait_for_page_to_load("30000")
        #check 'Shared by me' filter for web_illustration
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        self.selenium.click("//button[@value='ung_domain/shared.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No Result"))
        self.assertEqual("Shared by me", self.selenium.get_text(
                                              "//button[@class=\"tree-open\"]"))
        self.failUnless(self.selenium.is_text_present(web_illustration_name))
        self.failIf(self.selenium.is_text_present(web_page_name))
        self.failIf(self.selenium.is_text_present(web_table_name))
        #share web_page and web_table
        self.selenium.open(web_page_url)
        self.selenium.click("//a[@id=\"share_document\"]")
        self.selenium.wait_for_page_to_load("30000")
        self.selenium.open(web_table_url)
        self.selenium.click("//a[@id=\"share_document\"]")
        self.selenium.wait_for_page_to_load("30000")
        #check 'Shared by me' filter for all 3 documents
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        self.selenium.click("//button[@value='ung_domain/shared.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.failIf(self.selenium.is_text_present("No Result"))
        self.assertEqual("Shared by me", self.selenium.get_text(
                                              "//button[@class=\"tree-open\"]"))
        self.failUnless(self.selenium.is_text_present(web_illustration_name))
        self.failUnless(self.selenium.is_text_present(web_page_name))
        self.failUnless(self.selenium.is_text_present(web_table_name))

        #test 'Hidden' filter
        #to hide a document, it first have to be shared
        #this is why 'Shared by me' filter is tested before Hidden filter
        #so first, hide web_illustration
        # this try/except is because page 'web_illustration_url + '/hide'
        # doesn't trigger wait_for_page_to_load
        self.selenium.set_timeout(1)
        try:
            self.selenium.open(web_illustration_url + '/hide')
            self.selenium.wait_for_page_to_load("10000")
        except:
            pass
        self.selenium.set_timeout(30000)
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        #check 'Hidden' filter for web_illustration
        self.selenium.click("//button[@value='ung_domain/hidden.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual("Hidden", self.selenium.get_text(
                                              "//button[@class=\"tree-open\"]"))
        self.failUnless(self.selenium.is_text_present(web_illustration_name))
        self.failIf(self.selenium.is_text_present(web_page_name))
        self.failIf(self.selenium.is_text_present(web_table_name))
        #hide web_page and web_table
        self.selenium.set_timeout(1)
        try:
            self.selenium.open(web_page_url + '/hide')
            self.selenium.wait_for_page_to_load("10000")
        except:
            pass
        try:
            self.selenium.open(web_table_url + '/hide')
            self.selenium.wait_for_page_to_load("10000")
        except:
            pass
        self.selenium.set_timeout(30000)
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        #check 'Hidden' filter for all 3 documents
        self.selenium.click("//button[@value='ung_domain/hidden.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.assertEqual("Hidden", self.selenium.get_text(
                                              "//button[@class=\"tree-open\"]"))
        self.failUnless(self.selenium.is_text_present(web_illustration_name))
        self.failUnless(self.selenium.is_text_present(web_page_name))
        self.failUnless(self.selenium.is_text_present(web_table_name))

        #test 'Trash' filter
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.wait_ung_listbox_to_load()
        #open trash
        self.selenium.click("//button[@value='ung_domain/trash.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        #check 'Trash' filter, so that none of the 3 documents are present
        self.failIf(self.selenium.is_text_present(web_illustration_name))
        self.failIf(self.selenium.is_text_present(web_page_name))
        self.failIf(self.selenium.is_text_present(web_table_name))
        #go back default tree and delete than
        self.set_default_tree_view()
        self.wait_ung_listbox_to_load()
        for doc_index in range(3):
            self.selenium.click("//tr[@class='listbox-data-line-%d Data%s']"
                "/td[1]/input" % (doc_index, ('A', 'B')[doc_index % 2]))
        self.selenium.click("//button[@class='delete']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_for_activities()
        #test 'Trash' filter to see if all 3 documents are present
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        self.selenium.click("//button[@value='ung_domain/trash.0']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_ung_listbox_to_load()
        self.failUnless(self.selenium.is_text_present(web_illustration_name))
        self.failUnless(self.selenium.is_text_present(web_page_name))
        self.failUnless(self.selenium.is_text_present(web_table_name))
        #delete all 3 documents again
        for doc_index in range(3):
            self.selenium.click("//tr[@class='listbox-data-line-%d Data%s']"
                "/td[1]/input" % (doc_index, ('A', 'B')[doc_index % 2]))
        self.selenium.click("//button[@class='delete']")
        self.selenium.wait_for_page_to_load("30000")
        self.wait_for_activities()
        #check 'Trash' filter, so that none of the 3 documents are present again
        self.failIf(self.selenium.is_text_present(web_illustration_name))
        self.failIf(self.selenium.is_text_present(web_page_name))
        self.failIf(self.selenium.is_text_present(web_table_name))

        #check 'Starred' filter
        #XXX this is not implemented yet
        raise NotImplementedError("Starred filter is not implemented yet")

    def test_change_state_button(self):
        """test the possibility to change state of many documents
        from the standard ung default interface, using 'Change State' button
        - this test will change state from 'Draft' to 'Shared'"""
        test_time = int(unittest.time.time())
        #create 2 web_page
        for doc_index in range(2):
            self.create_document('page', name="Functional UNG Test %d - "
                                        "Web Page %d" % (test_time, doc_index))
        self.open_ung_default_page('ung', wait_for_activities=1)
        #select the 2 documents created
        for doc_index in range(1, 3):
            self.selenium.click(
                "//table[@class=\"listbox listbox listbox-table\"]/tbody/"
                                               "tr[%d]/td[1]/input" % doc_index)
        #try to change state of both documents
        raise Exception("Need to fix permissions/behaviour when changing "
                                                "the state.")
        self.selenium.click("//button[@class=\"change_state\"]")
        self.selenium.wait_for_condition(
                          "selenium.isTextPresent('Change State of Documents')")

    def test_select_all_and_deselect_all(self):
        """test the button to select all documents and deselect all documents"""
        test_time = int(unittest.time.time())
        #create 3 documents
        for doc_index in range(3):
            web_page_name = "Functional UNG Test %d - Web Page %d" % (test_time, doc_index)
            web_page_url = self.create_document('page', web_page_name)
        #assert no checkbox is checked
        self.open_ung_default_page()
        self.failIf(self.selenium.is_checked("//tr[@class='your_listbox-data-line-0 DataA']/td[1]/input"))
        self.failIf(self.selenium.is_checked("//tr[@class='your_listbox-data-line-1 DataB']/td[1]/input"))
        self.failIf(self.selenium.is_checked("//tr[@class='your_listbox-data-line-2 DataA']/td[1]/input"))
        #click button to check all
        self.selenium.click("//input[@name='your_listbox_checkAll:method']")
        #check all checkboxes are selected
        self.failUnless(self.selenium.is_checked("//tr[@class='your_listbox-data-line-0 DataA']/td[1]/input"))
        self.failUnless(self.selenium.is_checked("//tr[@class='your_listbox-data-line-1 DataB']/td[1]/input"))
        self.failUnless(self.selenium.is_checked("//tr[@class='your_listbox-data-line-2 DataA']/td[1]/input"))
        #click button to deselect all
        self.selenium.click("//input[@name='your_listbox_uncheckAll:method']")
        #check all cheboxes are deselected
        self.failIf(self.selenium.is_checked("//tr[@class='your_listbox-data-line-0 DataA']/td[1]/input"))
        self.failIf(self.selenium.is_checked("//tr[@class='your_listbox-data-line-1 DataB']/td[1]/input"))
        self.failIf(self.selenium.is_checked("//tr[@class='your_listbox-data-line-2 DataA']/td[1]/input"))

    def test_pagination_with_many_documents(self):
        """UNG Docs should paginate when many documents are present.
        Test that the action of paginate will work, given that many documents
        are present."""
#        #XXX this test needs an empty instance
        test_time = int(unittest.time.time())
        page_title = "Functional UNG Test %d - Web Page " % test_time
        #add many documents to ensure that it has to paginate
        for doc_index in range(1, 101):
            self.selenium.open("ERP5Site_createNewWebDocument?template=web_page_template")

            self.selenium.click("//a[@name=\"document_title\"]")
            self.selenium.type("name", page_title + str(doc_index))
            self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/span")
            self.selenium.wait_for_page_to_load("30000")

        self.wait_for_activities()
        self.open_ung_default_page(clear_cache=1, wait_for_activities=1)
        self.selenium.wait_for_page_to_load("30000")
        #assert first and last (relative) documents on first page
        self.assertEqual('1', self.selenium.get_value("//input[@name='your_listbox_page_start']"))
        self.assertTrue(self.selenium.is_text_present(page_title + '100'))
        self.assertTrue(self.selenium.is_text_present(page_title + '84'))
        #NEXT BUTTON
        # assert first and last (relative) documents on third page
        for next_page in range(2):
            self.selenium.click("//button[@name='nextPage']")
            self.selenium.wait_for_page_to_load("30000")
        self.assertEqual('3', self.selenium.get_value("//input[@name='your_listbox_page_start']"))
        self.assertTrue(self.selenium.is_text_present(page_title + '66'))
        self.assertTrue(self.selenium.is_text_present(page_title + '50'))
        #PREVIOUS BUTTON
        # assert first and last (relative) documents on second page
        self.selenium.click("//button[@name='previousPage']")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual('2', self.selenium.get_value("//input[@name='your_listbox_page_start']"))
        self.assertTrue(self.selenium.is_text_present(page_title + '83'))
        self.assertTrue(self.selenium.is_text_present(page_title + '67'))
        #TEXT INPUT
        # assert that entering a number at input and pressing enter will
        # go to that page
        self.selenium.type("//input[@name='your_listbox_page_start']", '4')
        self.selenium.key_press("//input[@name='your_listbox_page_start']", '\\13')
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual('4', self.selenium.get_value("//input[@name='your_listbox_page_start']"))
        self.assertTrue(self.selenium.is_text_present(page_title + '49'))
        self.assertTrue(self.selenium.is_text_present(page_title + '33'))
        #LAST BUTTON
        # assert first and last (relative) documents on last page
        last_page_number = self.selenium.get_text("//div[@class='listbox-navigation']").split('/')[1].strip()
        self.selenium.click("//button[@name='lastPage']")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual(last_page_number, self.selenium.get_value("//input[@name='your_listbox_page_start']"))
        self.assertTrue(self.selenium.is_text_present(page_title + '15'))
        self.assertTrue(self.selenium.is_text_present(page_title + '1'))
        #FIRST BUTTON
        # assert first and last (relative) documents on first page
        self.selenium.click("//button[@name='firstPage']")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual('1', self.selenium.get_value("//input[@name='your_listbox_page_start']"))
        self.assertTrue(self.selenium.is_text_present(page_title + '100'))
        self.assertTrue(self.selenium.is_text_present(page_title + '84'))


if __name__ == "__main__":
    unittest.main()

