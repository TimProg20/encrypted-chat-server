
module.exports = function(data) {

  if (data.login == "") {

    return {
      success: false,
      result: 'Login is required'
    }
  }

  if (data.password == "") {
  
    return {
      success: false,
      result: 'Password is required'
    }
  }

  return { success: true }
};