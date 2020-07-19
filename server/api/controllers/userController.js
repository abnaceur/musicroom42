const userService = require('../services/userServices/index');

createNewAccount = (req, res, next) => {
    userService.createNewAccountService.addNewUser(req, req.body, res);
}

loginUser = (req, res, next) => {
    userService.userLoginService.userLogin(req.body, res);
}


validateAccount = (req, res, next) => {
    let token = req.params.token;
    userService.userAccountValidationService.validateEmailAddress(res, token);
}

getUserById = (req, res, next) => {
    let id = req.params.id
    userService.getUserService.getUserById(res, id);
}

deleteUserById = (req, res, next) => {
    let id = req.user.id
    userService.deleteUserService.deleteUser(res, id);
}

resetPassword = (req, res, next) => {
    userService.resetPwdService.resetPwd(req.body.email.email, res);
}

updateUser = (req, res, next) => {
    let updateUser = req.body;
    let id = req.user.id
    userService.updateUserService.updateUserData(id, updateUser, res)
}

updateUserPassword = (req, res, next) => {
    let updateUser = req.body;
    let id = req.user.id
    userService.updateUserService.updateUserPassword(id, updateUser, res)
}

module.exports = {
    createNewAccount,
    validateAccount,
    deleteUserById,
    resetPassword,
    updateUserPassword,
    getUserById,
    loginUser,
    updateUser
}