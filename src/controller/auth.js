const authModel = require('../model/auth')
const jwt = require('jsonwebtoken')

//////////////////////////////////////////////////////////////////////////////
// Basic CRUD Methods
//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////
// Login Controller
//
// 1. Make sure that request is good
// 2. Attempt Login
// 3. Create token
// 4. Send back token
//////////////////////////////////////////////////////////////////////////////

function login(req, res, next){
  // 1. Make sure that request is good
  if(!req.body.email){
    return next({ status: 400, message: 'Bad request'})
  }

  if(!req.body.password){
    return next({ status: 400, message: 'Bad request'})
  }

  // 2. Attempt Login
  authModel.login(req.body.email, req.body.password)
  .then(function(user){

    // 3. Create token
    const token = jwt.sign({id: user.id}, process.env.SECRET)

    // 4. Send back token
    return res.status(200).send({ token })
  })
  .catch(next)
}


function getAuthStatus(req, res, next){
    res.status(200).send({id:req.claim.id}) //sends back the user ID
}

//////////////////////////////////////////////////////////////////////////////
// Quality of Life functions
//////////////////////////////////////////////////////////////////////////////

function isAuthenticated(req, res, next){

  if(!req.headers.authorization){
    return next({ status: 401, message: 'Unauthorized' })
  }
  const [scheme, credentials] = req.headers.authorization.split(' ')
  console.log(scheme)
  console.log(credentials)


  jwt.verify(credentials, process.env.SECRET, (err, payload)=>{
    if(err){
      return next({ status: 401, message: 'Unauthorized' })
    }

    req.claim = payload

    next()
  })
}

function isSelf(req, res, next){

  if(parseInt(req.params.id) !== req.claim.id){
    return next({ status: 401, message: 'Unauthorized' })
  }

  next()
}



module.exports = {
  login,
  getAuthStatus,
  isAuthenticated,
  isSelf
}
