from base import BaseUNGTest
import unittest
import time

class TestUNGSubjectList(BaseUNGTest):
    def test_ung_subject_list(self):
        sel = self.selenium
#       <tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/init" />
        self.init()

        #XXX: by orders, can't create user on test's instance. So, using default user
#       <tal:block metal:use-macro="here/Zuite_CommonTemplateForUNG/macros/create-user" />
        self.login_as_default_user()

        #XXX should catalog handle selections with float points?
        # because searches (from subjects) like 1231423.453 and 3454353.4234 return same results"
        # that I think are all results searched discarding the float number
        test_subject_time = int(time.time())

        #FIXME: sometimes, when selenium leave last browser opened on Subject sections, when browser open again,
        #the subject list is opened by default, instead of the "All documents", different from what occurs on a normal browser
        #where All documents is always listed by default on a new page
        #set default tree view as All Documents (tree opened or not)
        self.set_default_tree_view()

        sel.open("ERP5Site_createNewWebDocument?template=web_page_template")
        sel.wait_for_page_to_load('30000')
        sel.click("//a[@name='document_title']")
        sel.click("//p[@id='more_properties']") #"Edit More Properties"
        sel.type("//textarea[@id='keyword_list']", "UNG Test Subject %d" % test_subject_time)
        sel.click("//div[@class='ui-dialog-buttonset']/button[1]")
        sel.wait_for_page_to_load("30000")
        self.failUnless(sel.is_element_present("//meta[@content='UNG Test Subject %d']" % test_subject_time))
        self.go_home(clear_cache=1)
        self.failIf(sel.is_text_present("Ung test subject %d" % test_subject_time))
        self.go_home(clear_cache=1, wait_for_activities=1)
        self.set_default_tree_view()
        sel.click("//button[@value='ung_domain/by_subject.0']")
        sel.wait_for_page_to_load('30000')
        #XXX precisa dessa condition? ela esta falhando sempre sem pdb, faca o que eu fizer
#        sel.wait_for_condition("selenium.isTextPresent(\"Ung test subject %d\")" % test_subject_time, "30000")
        self.assertEqual("Ung test subject %d" % test_subject_time, sel.get_text("//button[@value='ung_domain/by_subject/subject_UNG Test Subject %d.1']" % test_subject_time))
        self.failUnless(sel.is_element_present("//button[@value='ung_domain/by_subject/subject_UNG Test Subject %d.1']" % test_subject_time))

        sel.click("//tr[@class='your_listbox-data-line-0 DataA']/td[3]/a")
        sel.wait_for_page_to_load('30000')
        sel.click("//a[@name='document_title']")
        sel.click("//p[@id='more_properties']") #"Edit More Properties"
        sel.run_script("document.getElementById('keyword_list').value = 'UNG Test VPN %(time)d\\nUNG Test Cloudooo %(time)d'" % {'time' : test_subject_time})
        sel.click("//div[@class='ui-dialog-buttonset']/button[1]")
        sel.wait_for_page_to_load('30000')
        self.go_home(clear_cache=1)
        #XXX it's already opened
        #sel.click("//button[@value='ung_domain/by_subject.0']")

#        sel.wait_for_page_to_load('30000')
        #assert that when changing subjects, the old subjects (existing anymore) are not presented anymore
        self.failIf(sel.is_element_present("//button[@value='ung_domain/by_subject/subject_UNG Subject %d.1']" % test_subject_time))
        self.failUnless(sel.is_element_present("//button[@value='ung_domain/by_subject/subject_UNG Test VPN %d.1']" % test_subject_time))
        self.assertEqual("Ung test vpn %d" % test_subject_time, sel.get_text("//button[@value='ung_domain/by_subject/subject_UNG Test VPN %d.1']" % test_subject_time))
        self.failUnless(sel.is_element_present("//button[@value='ung_domain/by_subject/subject_UNG Test Cloudooo %d.1']" % test_subject_time))
        self.assertEqual("Ung test cloudooo %d" % test_subject_time, sel.get_text("//button[@value='ung_domain/by_subject/subject_UNG Test Cloudooo %d.1']" % test_subject_time))

        sel.open("ERP5Site_createNewWebDocument?template=web_table_template")
        sel.wait_for_page_to_load("30000")
        sel.click("//a[@name=\"document_title\"]")
        sel.type("//input[@id=\"name\"]", "Document Sample")
        sel.click("//p[@id=\"more_properties\"]")
        sel.type("//textarea[@id=\"keyword_list\"]", "UNG Test Web Table Subject %d" % test_subject_time)
        sel.click("//div[@class=\"ui-dialog-buttonset\"]/button[1]")
        sel.wait_for_page_to_load("30000")

        self.clear_cache()
        self.wait_for_activities()
        sel.open("")
        sel.wait_for_page_to_load("30000")
        #XXX by_subject is already selected -- i think it's not correct
        #TODO: find if this is correct behaviour (by_subject already selected)
        #sel.click("//button[@value='ung_domain/by_subject.0']")
        #sel.wait_for_page_to_load(3000)
        #XXX precisa dessa condition? ela esta falhando sempre sem pdb, faca o que eu fizer
        # tinha a condition aqui para o elemento que pega-se texto logo abaixo, basta recriar a linha
        #import ipdb; ipdb.set_trace()
        self.assertEqual("Ung test web table subject %d" % test_subject_time, sel.get_text("//button[@value='ung_domain/by_subject/subject_UNG Test Web Table Subject %d.1']" % test_subject_time))
        sel.click("//button[@value='ung_domain/by_subject/subject_UNG Test Web Table Subject %d.1']" % test_subject_time)
        sel.wait_for_page_to_load("30000")
        self.failUnless(sel.is_element_present("//table[@class=\"listbox your_listbox your_listbox-table\"]/tbody/tr[1]/td[1]/input"))
        self.failUnless(sel.is_element_present("//table[@class=\"listbox your_listbox your_listbox-table\"]/tbody/tr[1]/td[2]/input"))
        #assert only one element is present, because only one 'table' element was created
        self.failIf(sel.is_element_present("//table[@class=\"listbox your_listbox your_listbox-table\"]/tbody/tr[2]/td[1]/input"))

if __name__ == "__main__":
    unittest.main()

