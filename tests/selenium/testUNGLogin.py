from UNGTestMixin import UNGTestMixin
import unittest


class TestUNGLogin(UNGTestMixin):
    """tests related to login on UNG"""

    def test_login(self):
        """try to login as different users"""
        self.selenium.open("WebSite_logout")
        self.login_as_default_user()

        #XXX bug because All Documents is not selected by default (it's saving "cache")
        self.set_default_tree_view()
        self.assertEqual("All Documents", self.selenium.get_text("//button[@class='tree-open']"))
        self.assertEqual("Settings", self.selenium.get_text("//a[@id='settings']"))
        self.failUnless(self.selenium.is_text_present("Web Illustration"))
        self.failUnless(self.selenium.is_text_present("Web Page"))
        self.failUnless(self.selenium.is_text_present("Web Table"))
        #XXX: the user used on test's instance is 'test_user'
        self.failUnless(self.selenium.is_text_present("test_user"))
        self.selenium.click("link=Sign out")
        self.selenium.wait_for_page_to_load(5000)
        self.failUnless(self.selenium.is_text_present("Welcome to UNG Web Office"))
        self.failUnless(self.selenium.is_text_present("Create an account now"))
        self.selenium.click("//td[@id='new-account-form']")
        self.selenium.click("//td[@id='back-login']")
        #XXX: user is not created and, by orders, can't be created
        #<tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/create-user" />
        self.selenium.type("__ac_name", "ung_user2")
        self.selenium.type("__ac_password", "1234")
        self.selenium.click("//input[@value='Login']")
        self.selenium.wait_for_page_to_load(5000)
        self.assertEqual("ung_user2", self.selenium.get_text("//div[@class=\' navigation-right\']/fieldset/div[2]/div/div/a[2]"))

    def test_login_using_enter_key(self):
        """try to login, submitting login form using 'enter' key (code 13)"""
        self.selenium.open("WebSite_logout")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.type("__ac_name", "ung_user2")
        self.selenium.type("__ac_password", "1234")
        self.selenium.key_press("//input[@value='Login']", '\\13')
        self.selenium.wait_for_page_to_load(5000)
        self.assertEqual("ung_user2", self.selenium.get_text("//div[@class=\' navigation-right\']/fieldset/div[2]/div/div/a[2]"))


if __name__ == "__main__":
    unittest.main()

