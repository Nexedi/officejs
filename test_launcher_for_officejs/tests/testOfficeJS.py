from unittest import TestCase
import subprocess

class OFFICEJSTest(TestCase):

  def setUp(self):
    pass

  def tearDown(self):
    pass

  def test_01_officejs_without_requirejs(self):
    """
    Launch officejs test without requirejs
    """
    root_directory = __file__[0:-len("/test_launcher_for_officejs/tests/testOfficeJS.py")]
    command = ["%s %s %s; exit 0" % (
          '%s/node_modules/.bin/phantomjs' % root_directory,
          '%s/test/run-qunit.js' % root_directory,
          '%s/test/officejs.html' % root_directory)]
    print command
    result = subprocess.check_output(
       command,
       stderr=subprocess.STDOUT,
       shell=True)
    print result
    self.assertTrue(result.find("assertions of")>=0)
    # we should have string like 443 assertions of 444 passed, 1 failed.
    total_quantity = 0
    passed_quantity = 0
    failed_quantity = 0
    for line in result.split('\n'):
      if line.find("assertions of") >=0:
        splitted_line = line.split()
        passed_quantity = splitted_line[0]
        total_quantity = splitted_line[3]
        failed_quantity = splitted_line[5]
    self.assertTrue(total_quantity > 0)
    print "\nOFFICEJS SUB RESULT: %s Tests, %s Failures" % (total_quantity,
          failed_quantity)
