// module.exports = (req, res, next) => {
//   console.log(req, res)
//   req.body.direction && req.body.next_room_id
//    console.log('B', req.body.direction, req.body.next_room_id)// req.body.direction = move
//   next()
//   : console.log('Body', req.body)
//   next()
// }

module.exports = (req, res, next) => {
  console.log('Req & Res', req, res)
  if (req.body.direction && req.body.next_room_id) {
    console.log('B', req.body.direction, req.body.next_room_id)// req.body.direction = move
    
    next()
  } else {
    console.log('Body', req.body)
    next()
  }
}