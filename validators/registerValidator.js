
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

  if (data.password !== data.repeat) {
  
    return {
      success: false,
      result: 'Passwords aren\'t equal'
    }
  }

  return { success: true }
};