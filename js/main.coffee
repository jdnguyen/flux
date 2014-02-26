stage = new createjs.Stage("canvas")
_my_ship = new createjs.Bitmap("img/my_ship.png")
_my_pulled_bullets = []
_my_pushed_bullets = []
_ship_width = 50
_ship_height = 30
_my_ship_speed = 5
_my_ship_target_x = null

_bullet_size = 5
_bullet_speed = 3
_bullet_push_multiplier = 5
_bullet_pull_multiplier = 2

_my_shield = new createjs.Shape()
_flux_radius = 60
_flux_activate = false
_flux_capture = false

_enemy_ships = []
_enemy_bullets = []
_enemy_spawn_counter = 0
_enemy_spawn_rate = 120
_enemy_shoot_rate = 60

init = ->
  _enemy_ships = []
  _enemy_bullets = []

  _my_shield.graphics.beginFill("#37FDFC").drawCircle 0, 0, _flux_radius
  _my_ship.x = 100
  _my_ship.y = stage.canvas.height - _ship_height
  _my_shield.x = _my_ship.x + 25
  _my_shield.y = _my_ship.y + _flux_radius/4
  _my_shield.alpha = 0.1
  stage.addChild _my_shield
  stage.addChild _my_ship

  stage.on "stagemousemove", (evt) ->
    if evt.rawY < stage.canvas.height
      _my_ship_target_x = evt.stageX - _ship_width/2

  stage.on "mouseleave", (evt) ->
    _my_ship_target_x = null

  stage.on "stagemousedown", (evt) ->
    if !_flux_activate
      _flux_activate = true
      _flux_capture = true

  stage.on "stagemouseup", (evt) ->
    _flux_activate = false
    _flux_capture = false
    pushBullets()

  createjs.Ticker.on "tick", update
  createjs.Ticker.setFPS 60
  spawnEnemy()

update = ->
  enemyBulletTravel()
  enemyShipMovement()
  enemyShipSpawn()
  myShipMove()
  myPulledBulletTravel()
  myPushedBulletTravel()

  if _flux_capture
    _flux_capture = false
  stage.update()

pushBullets = ->
  i = _my_pulled_bullets.length - 1
  while i >= 0
    bullet = _my_pulled_bullets[i]
    direction = bullet.charge/_bullet_push_multiplier
    direction = if direction > 1 then direction else 1
    bullet.dir_x *= -direction
    bullet.dir_y *= -direction
    _my_pushed_bullets.push bullet
    i--
  _my_pulled_bullets = []

myPushedBulletTravel = ->
  i = _my_pushed_bullets.length - 1
  while i >= 0
    bullet = _my_pushed_bullets[i]
    if bullet.y < -50
      stage.removeChild bullet.shape
      _my_pushed_bullets.splice(i, 1)

    e = _enemy_ships.length - 1
    while e >= 0
      ship = _enemy_ships[e]
      if checkHit(bullet, ship.shape)
        stage.removeChild bullet.shape
        stage.removeChild ship.shape
        _my_pushed_bullets.splice(i, 1)
        _enemy_ships.splice(e, 1)
        bullet = null
        e = 0
      e--

    if bullet
      bullet.shape.x += bullet.dir_x
      bullet.shape.y += bullet.dir_y
    i--

myPulledBulletTravel = ->
  i = _my_pulled_bullets.length - 1
  while i >= 0
    bullet = _my_pulled_bullets[i]
    if checkHit(bullet, _my_ship)
      stage.removeChild bullet.shape
      _my_pulled_bullets.splice(i, 1)
      console.log "MY SHIP GOT HIT BY OWN BULLET"
    else
      bullet.shape.x += bullet.dir_x
      bullet.shape.y += bullet.dir_y
      bullet.charge++
    i--

myShipMove = ->
  if _my_ship_target_x and Math.abs(_my_ship_target_x - _my_ship.x) > _my_ship_speed
    speed = _my_ship_speed
    if _my_ship_target_x < _my_ship.x
      speed *= -1

    _my_ship.x += speed
    _my_shield.x += speed

    i = _my_pulled_bullets.length - 1
    while i >= 0
      _my_pulled_bullets[i].shape.x += speed
      i--

enemyBulletTravel = ->
  i = _enemy_bullets.length - 1
  while i >= 0
    bullet = _enemy_bullets[i]
    if bullet.shape.y >= stage.canvas.height
      stage.removeChild bullet.shape
      _enemy_bullets.splice(i, 1)
    else
      if checkHit(bullet, _my_ship)
        stage.removeChild bullet.shape
        _enemy_bullets.splice(i, 1)
        console.log "MY SHIP GOT HIT"
      else if _flux_capture and checkHit(bullet, _my_shield)
        _enemy_bullets[i].shape.graphics.clear().beginFill("#49E20E").drawCircle 0, 0, _bullet_size
        _my_pulled_bullets.push retargetBullet(_enemy_bullets[i])
        _enemy_bullets.splice(i, 1)
      else
        bullet.shape.x += bullet.dir_x
        bullet.shape.y += bullet.dir_y
    i--

retargetBullet = (bullet) ->
  shape = bullet.shape
  target_x = _my_ship.x + _ship_width/2
  target_y = _my_ship.y + _ship_height/2

  dist = Math.sqrt( Math.pow(target_x - shape.x,2) + Math.pow(target_y - shape.y,2))
  bullet.dir_x = (target_x - shape.x)/dist/_bullet_pull_multiplier
  bullet.dir_y = (target_y - shape.y)/dist/_bullet_pull_multiplier
  bullet.charge = 0
  return bullet

checkHit = (obj_a, obj_b) ->
  pt = obj_a.shape.localToLocal(0,0,obj_b)
  return obj_b.hitTest(pt.x, pt.y)

enemyShipSpawn = ->
  _enemy_spawn_counter++
  if _enemy_spawn_counter >= _enemy_spawn_rate
    _enemy_spawn_counter = 0
    spawnEnemy()

enemyShipMovement = ->
  i = _enemy_ships.length - 1
  while i >= 0
    ship = _enemy_ships[i]
    ship.shape.x -= 2
    if ship.shape.x + _ship_width <= 0
      stage.removeChild ship.shape
      _enemy_ships.splice(i, 1)
    else
      ship.shootCounter++
      if ship.shootCounter >= ship.shootDelay
        ship.shootCounter = 0
        _enemy_bullets.push createBullet(ship.shape.x, ship.shape.y)
    i--

createBullet = (start_x, start_y) ->
  shape = new createjs.Shape()
  shape.graphics.beginFill("red").drawCircle 0, 0, _bullet_size
  shape.x = start_x + _ship_width/2
  shape.y = start_y + _ship_height
  target_x = _my_ship.x + _ship_width/2
  target_y = _my_ship.y + _ship_height/2

  dist = Math.sqrt( Math.pow(target_x - shape.x,2) + Math.pow(target_y - shape.y,2)) / _bullet_speed
  nx = (target_x - shape.x)/dist
  ny = (target_y - shape.y)/dist

  stage.addChild shape
  return bullet=
    shape: shape
    dir_x: nx
    dir_y: ny

spawnEnemy = ->
  shape = new createjs.Bitmap("img/ship_3.png")
  shape.x = stage.canvas.width
  shape.y = 50
  _enemy_ship=
    shape: shape
    shootDelay: _enemy_shoot_rate
    shootCounter: 0
  _enemy_ships.push _enemy_ship
  stage.addChild shape

init()