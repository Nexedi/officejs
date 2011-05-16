from base import BaseUNGTest
import unittest

class TestUNGLogin(BaseUNGTest):
    def test_ung_login(self):
        sel = self.selenium
        self.login_as_default_user()

        #XXX bug because All Documents is not selected by default (it's saving "cache")
        self.set_default_tree_view()
        self.assertEqual("All Documents", sel.get_text("//button[@class='tree-open']"))
        self.assertEqual("Settings", sel.get_text("//a[@id='settings']"))
        self.failUnless(sel.is_text_present("Web Illustration"))
        self.failUnless(sel.is_text_present("Web Page"))
        self.failUnless(sel.is_text_present("Web Table"))
        #XXX: the user used on test's instance is 'nsi'
        self.failUnless(sel.is_text_present("test_user"))
        sel.click("link=Sign out")
        sel.wait_for_page_to_load(5000)
        self.failUnless(sel.is_text_present("Welcome to UNG Web Office"))
        self.failUnless(sel.is_text_present("Create an account now"))
        sel.click("//td[@id='new-account-form']")
        sel.click("//td[@id='back-login']")
        #XXX: user is not created and, by orders, can't be created
        #<tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/create-user" />
#        sel.type("__ac_name", "ung_user")
#        sel.type("__ac_password", "1234")
#        sel.click("//input[@type='submit']")
#        sel.wait_for_page_to_load(5000)
#        try: self.assertEqual("ung_user", sel.get_text("//div[@class=\' navigation-right\']/fieldset/div[2]/div/div/a[2]"))
#        except AssertionError, e: self.verificationErrors.append(str(e))


if __name__ == "__main__":
    unittest.main()

