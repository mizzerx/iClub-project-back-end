export default {
  createRandomPassword: function (length) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890';
    var pass = '';
    for (var x = 0; x < length; x++) {
      var i = Math.floor(Math.random() * chars.length);
      pass += chars.charAt(i);
    }
    return pass;
  },
  generateInviteCodeString: function () {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890';
    var code = '';
    for (var x = 0; x < 6; x++) {
      var i = Math.floor(Math.random() * chars.length);
      code += chars.charAt(i);
    }
    return code;
  },
};
