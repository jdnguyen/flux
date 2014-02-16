stage = new createjs.Stage("canvas")
_my_ship = new createjs.Shape()
_ship_width = 80
_ship_height = 30
_bullet_size = 5
_bullet_speed = 3

_enemy_ships = []
_enemy_bullets = []

init = ->
  _enemy_ships = []
  _enemy_bullets = []

  _my_ship.graphics.beginFill("blue").drawRect 0, 0, _ship_width, _ship_height
  _my_ship.x = 100
  _my_ship.y = stage.canvas.height - _ship_height
  stage.addChild _my_ship

  stage.on "stagemousemove", (evt) ->
    _my_ship.x = evt.stageX - _ship_width/2

  createjs.Ticker.on "tick", update
  createjs.Ticker.setFPS 60
  spawnEnemy()

update = ->
  enemyBulletTravel()
  enemyShipMovement()

  stage.update()

enemyBulletTravel = ->
  i = 0

  while i < _enemy_bullets.length
    bullet = _enemy_bullets[i]
    bullet.shape.x += bullet.dir_x
    bullet.shape.y += bullet.dir_y
    if bullet.shape.y <= 0
      stage.removeChild bullet.shape
      _enemy_bullets.splice(i, 1)
    else
      pt = bullet.shape.localToLocal(0,0,_my_ship)
      console.log "MY SHIP GOT HIT" if _my_ship.hitTest(pt.x, pt.y)
    i++

enemyShipMovement = ->
  i = 0

  while i < _enemy_ships.length
    ship = _enemy_ships[i]
    ship.shape.x -= 2
    if ship.shape.x + _ship_width <= 0
      stage.removeChild ship.shape
      _enemy_ships.splice(i, 1)
      spawnEnemy()
    else
      ship.shootCounter++
      if ship.shootCounter >= ship.shootDelay
        ship.shootCounter = 0
        createBullet(ship.shape.x, ship.shape.y)
    i++

createBullet = (start_x, start_y) ->
  shape = new createjs.Shape()
  shape.graphics.beginFill("yellow").drawCircle 0, 0, _bullet_size
  shape.x = start_x + _ship_width/2
  shape.y = start_y + _ship_height
  target_x = _my_ship.x + _ship_width/2
  target_y = _my_ship.y + _ship_height/2

  dist = Math.sqrt( Math.pow(target_x - shape.x,2) + Math.pow(target_y - shape.y,2)) / _bullet_speed
  nx = (target_x - shape.x)/dist
  ny = (target_y - shape.y)/dist

  _bullet=
    shape: shape
    dir_x: nx
    dir_y: ny
  _enemy_bullets.push _bullet
  stage.addChild shape

spawnEnemy = ->
  shape = new createjs.Shape()
  shape.graphics.beginFill("red").drawRect 0, 0, _ship_width, _ship_height
  shape.x = stage.canvas.width
  shape.y = 100
  _enemy_ship=
    shape: shape
    shootDelay: 40
    shootCounter: 0
    difficulty: 1
  _enemy_ships.push _enemy_ship
  stage.addChild shape

init()