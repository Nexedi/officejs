from base import BaseUNGTest
import unittest

#from tr to sel.
#search:    \<tr\>.*\n.*\<td\>(.*)\<\/td\>.*\n.*\<td\>(.*)\<\/td\>.*\n.*\<td\>(.*)\<\/td\>.*\n.*\<\/tr\>
#replace:   sel.\1(\2, \3)

#from sel.verifyTextNotPresent to sel.failIf
#search:    sel.verifyTextNotPresent\((.*)\)
#replace:   self.failIf(sel.is_text_present(\1))

#from sel.verifyTextPresent to sel.failUnless
#search:    sel.verifyTextPresent\((.*), \"\"\)
#replace:   self.failUnless(sel.is_text_present(\1))

#search:   waitForCondition
#replace: wait_for_condition

#attention here to the '?' after .*, making the regular expression un-greedy
#search:   sel.is_element_present\((.*?)\)
#replace:  str(str(sel.is_element_present(\1)).lower()).lower()

#search:   sel.verifyAttribute\((.*), (.*)\)
#replace:  try: self.assertEqual(\2, sel.get_attribute(\1))
#       except AssertionError, e: self.verificationErrors.append(str(e))

#search: self.assertEqual("checked",
#replace: self.assertEqual(u'true',

#search: sel.openAndWait\((.*), \"\"\)
#replace: sel.open(\1)\n        sel.wait_for_page_to_load(5000)

#no search para wait_for_condition(
#replace o " de dentro do elemento por \"

class TestUNGSettings(BaseUNGTest):
    def test_ung_settings(self):
        sel = self.selenium
        self.login_as_default_user()
        #<tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/init" />
        #<tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/login" />

        self.failIf(sel.is_text_present('Text Format'))
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        self.failUnless(sel.is_text_present("Text Format"))
        self.failUnless(sel.is_text_present("FCK Editor"))
        sel.check("//input[@value=\'fck_editor\']")
        sel.check("//input[@value=\'text/html\']")
        sel.click("//html/body/div[3]/div[11]/div/button[1]")
        sel.wait_for_page_to_load(5000)
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'fck_editor\']@checked"))
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'text/html\']@checked"))
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        sel.check("//input[@value=\'text_area\']")
        sel.check("//input[@value=\'text/plain\']")
        sel.click("//html/body/div[3]/div[11]/div/button[1]")
        sel.wait_for_page_to_load(5000)
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'text/plain\']@checked"))
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'text_area\']@checked"))
        sel.click("//span[@class=\'ui-icon ui-icon-closethick\']")
        sel.open("WebSite_logout")
        sel.wait_for_page_to_load(5000)
        #don't try to create a new user since
        #test's instance already have one with login_name 'ung_user2'
        #XXX this is not correct, because it has t#o be created once a time
        # next ones, just login
##        sel.click("//td[@id='new-account-form']")
#   #     sel.type("//input[@name='firstname']", "Another")
#        sel#.type("//input[@name='lastname']", "User")
#        sel.type(#"//input[@name='email']", "example2@example.com")
#   #     sel.type("//input[@name='login_name']", "ung_use#r2")
#        sel.type("//input[@name='password']", "1#234")
#        sel.type("//input[@name='confirm']", "1234")
#        sel.click("//input[@value='Create Account']")
#        sel.wait_for_page_to_load(30000)
        sel.type("__ac_name", "ung_user2")
        sel.type("__ac_password", "1234")
        sel.click("//input[@type='submit']")
        sel.wait_for_page_to_load(5000)
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        sel.check("//input[@value=\'fck_editor\']")
        sel.check("//input[@value=\'text/html\']")
        sel.click("//html/body/div[3]/div[11]/div/button[1]")
        sel.wait_for_page_to_load(5000)
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        sel.check("//input[@value=\'fck_editor\']")
        sel.check("//input[@value=\'text/html\']")
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        sel.click("//html/body/div[3]/div[11]/div/button[1]")
        sel.wait_for_page_to_load(5000)
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'fck_editor\']@checked"))
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'text/html\']@checked"))
        sel.open("WebSite_logout")
        sel.wait_for_page_to_load(5000)
        sel.type("__ac_name", "test_user")
        sel.type("__ac_password", "test_user")
        sel.click("//input[@type='submit']")
        sel.wait_for_page_to_load(5000)
        sel.click("//a[@id='settings']")
        sel.wait_for_condition("selenium.isElementPresent(\"//input[@name=\'field_my_preferred_text_editor\']\")", "3000")
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'text_area\']@checked"))
        self.assertEqual(u'true', sel.get_attribute("//input[@value=\'text/plain\']@checked"))


if __name__ == "__main__":
    unittest.main()

