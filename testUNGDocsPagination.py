from UNGTestMixin import UNGTestMixin
import unittest

class TestUNGPagination(UNGTestMixin):
    """tests related to pagination on UNG Docs default page """
    def test_pagination_with_20_documents(self):
        """test that the action of paginate will work, given that 20 documents are added"""
        test_time = int(unittest.time.time())

        #add 20 documents to ensure that it has to paginate
        for doc_index in range(20):
            self.selenium.open("ERP5Site_createNewWebDocument?template=web_page_template")

            self.selenium.click("//a[@name=\"document_title\"]")
            self.selenium.type("name", "Functional UNG Test %d - Web Page %d" % (test_time, doc_index))
            self.selenium.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]/span")
            self.selenium.wait_for_page_to_load("30000")

        self.wait_for_activities()
        self.selenium.open("")
        self.selenium.wait_for_page_to_load("30000")
        #TODO: assert first and last document on first page
        # and then first and last (relative) created document on second page

        #XXX pagination is not implemented yet
        raise NotImplementedError



if __name__ == "__main__":
    unittest.main()

