from UNGTestMixin import UNGTestMixin
import unittest


class TestUNGSettings(UNGTestMixin):
    """tests related to UNG settings"""
    def test_saving_settings_even_on_different_users(self):
        """test that:
            - settings are correct displayed
            - settings remain saved
            - different users have different settings
        """
        self.failIf(self.selenium.is_text_present('Text Format'))
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.failUnless(self.selenium.is_text_present("Text Format"))
        self.failUnless(self.selenium.is_text_present("FCK Editor"))
        self.selenium.check("//input[@value=\'fck_editor\']")
        self.selenium.check("//input[@value=\'text/html\']")
        self.selenium.click("//html/body/div[3]/div[11]/div/button[1]")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.assertEqual(u'true', self.selenium.get_attribute(
                                      "//input[@value=\'fck_editor\']@checked"))
        self.assertEqual(u'true', self.selenium.get_attribute(
                                       "//input[@value=\'text/html\']@checked"))
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.selenium.check("//input[@value=\'text_area\']")
        self.selenium.check("//input[@value=\'text/plain\']")
        self.selenium.click("//html/body/div[3]/div[11]/div/button[1]")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.assertEqual(u'true', self.selenium.get_attribute(
                                      "//input[@value=\'text/plain\']@checked"))
        self.assertEqual(u'true', self.selenium.get_attribute(
                                       "//input[@value=\'text_area\']@checked"))
        self.selenium.click("//span[@class=\'ui-icon ui-icon-closethick\']")
        self.selenium.open("WebSite_logout")
        self.selenium.wait_for_page_to_load(5000)
        #don't try to create a new user since
        #test's instance already have one with login_name 'ung_user2'
        #XXX this is not correct, because it has to be created once a time
        # next ones, just login
##        self.selenium.click("//td[@id='new-account-form']")
#   #     self.selenium.type("//input[@name='firstname']", "Another")
#        sel#.type("//input[@name='lastname']", "User")
#        self.selenium.type(#"//input[@name='email']", "example2@example.com")
#   #     self.selenium.type("//input[@name='login_name']", "ung_use#r2")
#        self.selenium.type("//input[@name='password']", "1#234")
#        self.selenium.type("//input[@name='confirm']", "1234")
#        self.selenium.click("//input[@value='Create Account']")
#        self.selenium.wait_for_page_to_load(30000)
        self.selenium.type("__ac_name", "ung_user2")
        self.selenium.type("__ac_password", "1234")
        self.selenium.click("//input[@value='Login']")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.selenium.check("//input[@value=\'fck_editor\']")
        self.selenium.check("//input[@value=\'text/html\']")
        self.selenium.click("//html/body/div[3]/div[11]/div/button[1]")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.selenium.check("//input[@value=\'fck_editor\']")
        self.selenium.check("//input[@value=\'text/html\']")
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.selenium.click("//html/body/div[3]/div[11]/div/button[1]")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.assertEqual(u'true', self.selenium.get_attribute(
                                      "//input[@value=\'fck_editor\']@checked"))
        self.assertEqual(u'true', self.selenium.get_attribute(
                                       "//input[@value=\'text/html\']@checked"))
        self.selenium.open("WebSite_logout")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.type("__ac_name", "test_user")
        self.selenium.type("__ac_password", "test_user")
        self.selenium.click("//input[@value='Login']")
        self.selenium.wait_for_page_to_load(5000)
        self.selenium.click("//a[@id='settings']")
        self.selenium.wait_for_condition("selenium.isElementPresent(\"//input"
                                "[@name=\'field_my_preferred_text_editor\']\")",
                                          "30000")
        self.assertEqual(u'true', self.selenium.get_attribute(
                                       "//input[@value=\'text_area\']@checked"))
        self.assertEqual(u'true', self.selenium.get_attribute(
                                      "//input[@value=\'text/plain\']@checked"))


if __name__ == "__main__":
    unittest.main()

