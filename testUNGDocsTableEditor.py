from UNGTestMixin import UNGTestMixin
import unittest


class TestUNGDocsTableEditor(UNGTestMixin):
    def test_fill_some_cells_in_web_table(self):
        """test the action of add, fill cells, assert title of sheet and
        content of cells of a Web Table document"""
        self.selenium.open("ERP5Site_createNewWebDocument?template=web_table_template")
        self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Web Table", self.selenium.get_text("//a[@name=\"document_title\"]"))
        self.failUnless(self.selenium.is_element_present("//td[@id='0_table0_cell_c0_r1']"))
        self.failUnless(self.selenium.is_element_present("//td[@id='0_table0_cell_c1_r1']"))
        self.assertEqual("Spreadsheet Playground", self.selenium.get_text("//td[@id=\"jSheetTitle_0\"]"))
        self.assertEqual("MENU", self.selenium.get_text("//td[@id=\"jSheetMenu_0\"]/span[@class=\"rootVoice\"]"))
        self.selenium.run_script("$(\"#0_table0_cell_c0_r0\").html(\"Gabriel\")")
        self.selenium.run_script("$(\"#0_table0_cell_c1_r1\").html(\"Monnerat\")")
        self.selenium.click("//button[@class=\"save\"]")
        for page_reload in range(2):
            self.selenium.wait_for_page_to_load("30000")
        self.assertEqual("Gabriel", self.selenium.get_text("//td[@id='0_table0_cell_c0_r0']"))
        self.assertEqual("Monnerat", self.selenium.get_text("//td[@id='0_table0_cell_c1_r1']"))


if __name__ == "__main__":
    unittest.main()

