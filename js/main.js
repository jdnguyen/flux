// Generated by CoffeeScript 1.7.1
(function() {
  var checkHit, createBullet, drawHealth, drawPoints, enemyBulletTravel, enemyShipMovement, enemyShipSpawn, increaseDifficulty, init, initDraw, myPulledBulletTravel, myPushedBulletTravel, myShipMove, pushBullets, regenShield, reset, retargetBullet, spawnEnemy, stage, update, _bullet_pull_multiplier, _bullet_push_multiplier, _bullet_size, _difficulty, _difficulty_counter, _difficulty_max, _enemy_bullets, _enemy_ships, _enemy_spawn_counter, _enemy_spawn_rate, _flux_activate, _flux_capture, _flux_cooldown, _flux_counter, _flux_radius, _health, _health_board, _my_pulled_bullets, _my_pushed_bullets, _my_shield, _my_ship, _my_ship_speed, _my_ship_target_x, _points, _score_board, _ship_height, _ship_width;

  stage = new createjs.Stage("canvas");

  _points = 0;

  _score_board = new createjs.Text("", "20px Arial", "#00FF00");

  _health = 20;

  _health_board = new createjs.Text("", "20px Arial", "#00FF00");

  _difficulty = 1;

  _difficulty_counter = 0;

  _difficulty_max = 500;

  increaseDifficulty = function() {
    _difficulty_counter++;
    if (_difficulty_counter >= _difficulty_max) {
      _difficulty_counter = 0;
      _difficulty += 0.1;
      return _difficulty = parseFloat(_difficulty.toFixed(1));
    }
  };

  drawPoints = function() {
    return _score_board.text = "Score: " + _points;
  };

  drawHealth = function() {
    var color, hp;
    hp = _health < 0 ? 0 : _health;
    _health_board.text = "Health: " + Array(hp).join('| ');
    if (hp > 10) {
      color = "00FF00";
    } else if (hp > 5) {
      color = "FF7F00";
    } else {
      color = "FF0000";
    }
    return _health_board.color = color;
  };

  _my_ship = new createjs.Bitmap("img/my_ship.png");

  _my_pulled_bullets = [];

  _my_pushed_bullets = [];

  _ship_width = 50;

  _ship_height = 30;

  _my_ship_speed = 5;

  _my_ship_target_x = null;

  _flux_radius = 60;

  _flux_activate = false;

  _flux_capture = false;

  _flux_cooldown = 50;

  _flux_counter = 0;

  _my_shield = new createjs.Shape();

  _my_shield.graphics.beginFill("#37FDFC").drawCircle(0, 0, _flux_radius);

  myShipMove = function() {
    var i, speed, _results;
    if (_my_ship_target_x && Math.abs(_my_ship_target_x - _my_ship.x) > _my_ship_speed) {
      speed = _my_ship_speed;
      if (_my_ship_target_x < _my_ship.x) {
        speed *= -1;
      }
      _my_ship.x += speed;
      _my_shield.x += speed;
      i = _my_pulled_bullets.length - 1;
      _results = [];
      while (i >= 0) {
        _my_pulled_bullets[i].shape.x += speed;
        _results.push(i--);
      }
      return _results;
    }
  };

  regenShield = function() {
    if (_my_shield.alpha === 0) {
      _flux_counter++;
      if (_flux_counter >= _flux_cooldown) {
        _flux_counter = 0;
        return _my_shield.alpha = 0.1;
      }
    }
  };

  _enemy_ships = [];

  _enemy_bullets = [];

  _enemy_spawn_counter = 0;

  _enemy_spawn_rate = 120;

  enemyShipSpawn = function() {
    if (_enemy_spawn_counter % _enemy_spawn_rate === 0) {
      spawnEnemy(3, stage.canvas.width, 50, -2, 0, 60, 5, 1, 0);
    } else if (_enemy_spawn_counter > (500 / _difficulty)) {
      spawnEnemy(2, 0, 100, 1, 0, 5, 3, 20, 100);
      _enemy_spawn_counter = 0;
    }
    return _enemy_spawn_counter++;
  };

  spawnEnemy = function(type, x, y, x_dir, y_dir, shoot_rate, bullet_speed, bullet_shot_max, bullet_delay) {
    var shape, _enemy_ship;
    shape = new createjs.Bitmap("img/ship_" + type + ".png");
    shape.x = x;
    shape.y = y;
    _enemy_ship = {
      shape: shape,
      shootDelay: Math.round(shoot_rate / _difficulty),
      shootCounter: 0,
      bulletSpeed: Math.round(bullet_speed * _difficulty),
      bulletShotMax: bullet_shot_max,
      bulletShot: 0,
      bulletDelay: Math.round(bullet_delay / _difficulty),
      type: type,
      x_dir: x_dir,
      y_dir: y_dir
    };
    _enemy_ships.push(_enemy_ship);
    return stage.addChild(shape);
  };

  enemyShipMovement = function() {
    var i, ship, _results;
    i = _enemy_ships.length - 1;
    _results = [];
    while (i >= 0) {
      ship = _enemy_ships[i];
      if (ship.type === 2 && (ship.shape.x < 0 || ship.shape.x > 450)) {
        ship.x_dir *= -1;
      }
      ship.shape.x += ship.x_dir;
      ship.shape.y += ship.y_dir;
      if ((ship.shape.x + _ship_width <= 0) || (ship.shape.x >= stage.canvas.width)) {
        stage.removeChild(ship.shape);
        _enemy_ships.splice(i, 1);
      } else {
        ship.shootCounter++;
        if (ship.shootCounter > ship.bulletDelay && ship.shootCounter % ship.shootDelay === 0) {
          _enemy_bullets.push(createBullet(ship.shape.x, ship.shape.y, ship.bulletSpeed));
          ship.bulletShot++;
          if (ship.bulletShot > ship.bulletShotMax) {
            ship.bulletShot = 0;
            ship.shootCounter = 0;
          }
        }
      }
      _results.push(i--);
    }
    return _results;
  };

  _bullet_size = 5;

  _bullet_push_multiplier = 3;

  _bullet_pull_multiplier = 3;

  checkHit = function(obj_a, obj_b) {
    var pt;
    pt = obj_a.shape.localToLocal(0, 0, obj_b);
    return obj_b.hitTest(pt.x, pt.y);
  };

  createBullet = function(start_x, start_y, speed) {
    var bullet, dist, nx, ny, shape, target_x, target_y;
    shape = new createjs.Shape();
    shape.graphics.beginFill("red").drawCircle(0, 0, _bullet_size);
    shape.x = start_x + _ship_width / 2;
    shape.y = start_y + _ship_height;
    target_x = _my_ship.x + _ship_width / 2;
    target_y = _my_ship.y + _ship_height / 2;
    dist = Math.sqrt(Math.pow(target_x - shape.x, 2) + Math.pow(target_y - shape.y, 2)) / speed;
    nx = (target_x - shape.x) / dist;
    ny = (target_y - shape.y) / dist;
    stage.addChild(shape);
    return bullet = {
      shape: shape,
      dir_x: nx,
      dir_y: ny
    };
  };

  pushBullets = function() {
    var bullet, direction, i;
    i = _my_pulled_bullets.length - 1;
    while (i >= 0) {
      bullet = _my_pulled_bullets[i];
      direction = bullet.charge / _bullet_push_multiplier;
      direction = direction > 5 ? direction : 5;
      bullet.dir_x *= -direction;
      bullet.dir_y *= -direction;
      _my_pushed_bullets.push(bullet);
      i--;
    }
    return _my_pulled_bullets = [];
  };

  myPushedBulletTravel = function() {
    var bullet, e, i, ship, _results;
    i = _my_pushed_bullets.length - 1;
    _results = [];
    while (i >= 0) {
      bullet = _my_pushed_bullets[i];
      if (bullet.y < -50) {
        stage.removeChild(bullet.shape);
        _my_pushed_bullets.splice(i, 1);
      }
      e = _enemy_ships.length - 1;
      while (e >= 0) {
        ship = _enemy_ships[e];
        if (checkHit(bullet, ship.shape)) {
          _points++;
          stage.removeChild(bullet.shape);
          stage.removeChild(ship.shape);
          _my_pushed_bullets.splice(i, 1);
          _enemy_ships.splice(e, 1);
          bullet = null;
          e = 0;
        }
        e--;
      }
      if (bullet) {
        bullet.shape.x += bullet.dir_x;
        bullet.shape.y += bullet.dir_y;
      }
      _results.push(i--);
    }
    return _results;
  };

  myPulledBulletTravel = function() {
    var bullet, i, _results;
    i = _my_pulled_bullets.length - 1;
    _results = [];
    while (i >= 0) {
      bullet = _my_pulled_bullets[i];
      if (checkHit(bullet, _my_ship)) {
        stage.removeChild(bullet.shape);
        _my_pulled_bullets.splice(i, 1);
        if (_health < 20) {
          _health++;
        }
      } else {
        bullet.shape.x += bullet.dir_x;
        bullet.shape.y += bullet.dir_y;
        bullet.charge++;
      }
      _results.push(i--);
    }
    return _results;
  };

  enemyBulletTravel = function() {
    var bullet, i, _results;
    i = _enemy_bullets.length - 1;
    _results = [];
    while (i >= 0) {
      bullet = _enemy_bullets[i];
      if (bullet.shape.y >= stage.canvas.height) {
        stage.removeChild(bullet.shape);
        _enemy_bullets.splice(i, 1);
      } else {
        if (checkHit(bullet, _my_ship)) {
          stage.removeChild(bullet.shape);
          _enemy_bullets.splice(i, 1);
          _health -= 2;
        } else if (_flux_capture && checkHit(bullet, _my_shield)) {
          _enemy_bullets[i].shape.graphics.clear().beginFill("#49E20E").drawCircle(0, 0, _bullet_size);
          _my_pulled_bullets.push(retargetBullet(_enemy_bullets[i]));
          _enemy_bullets.splice(i, 1);
        } else {
          bullet.shape.x += bullet.dir_x;
          bullet.shape.y += bullet.dir_y;
        }
      }
      _results.push(i--);
    }
    return _results;
  };

  retargetBullet = function(bullet) {
    var dist, shape, target_x, target_y;
    shape = bullet.shape;
    target_x = _my_ship.x + _ship_width / 2;
    target_y = _my_ship.y + _ship_height / 2;
    dist = Math.sqrt(Math.pow(target_x - shape.x, 2) + Math.pow(target_y - shape.y, 2));
    bullet.dir_x = (target_x - shape.x) / dist / _bullet_pull_multiplier;
    bullet.dir_y = (target_y - shape.y) / dist / _bullet_pull_multiplier;
    bullet.charge = 0;
    return bullet;
  };

  init = function() {
    initDraw();
    stage.on("stagemousemove", function(evt) {
      if (evt.rawY < stage.canvas.height) {
        return _my_ship_target_x = evt.stageX - _ship_width / 2;
      }
    });
    stage.on("mouseleave", function(evt) {
      return _my_ship_target_x = null;
    });
    stage.on("stagemousedown", function(evt) {
      if (_health <= 0) {
        return reset();
      } else if (!_flux_activate && _my_shield.alpha === 0.1) {
        _flux_activate = true;
        return _flux_capture = true;
      }
    });
    stage.on("stagemouseup", function(evt) {
      _flux_activate = false;
      _flux_capture = false;
      pushBullets();
      return _my_shield.alpha = 0;
    });
    createjs.Ticker.on("tick", update);
    return createjs.Ticker.setFPS(60);
  };

  initDraw = function() {
    _my_ship.x = 100;
    _my_ship.y = stage.canvas.height - _ship_height;
    _my_shield.x = _my_ship.x + 25;
    _my_shield.y = _my_ship.y + _flux_radius / 4;
    _my_shield.alpha = 0.1;
    _score_board.x = 400;
    _score_board.y = 10;
    _health_board.x = 10;
    _health_board.y = 10;
    stage.addChild(_score_board);
    stage.addChild(_health_board);
    stage.addChild(_my_shield);
    return stage.addChild(_my_ship);
  };

  reset = function() {
    _health = 20;
    _points = 0;
    _enemy_bullets = [];
    _enemy_ships = [];
    _my_pulled_bullets = [];
    _my_pushed_bullets = [];
    _difficulty = 1;
    _difficulty_counter = 0;
    stage.removeAllChildren();
    return initDraw();
  };

  update = function() {
    var game_over, u_suck;
    if (_health > 0) {
      enemyBulletTravel();
      enemyShipMovement();
      enemyShipSpawn();
      myShipMove();
      myPulledBulletTravel();
      myPushedBulletTravel();
      regenShield();
      drawPoints();
      drawHealth();
      increaseDifficulty();
      if (_flux_capture) {
        _flux_capture = false;
      }
    } else {
      game_over = new createjs.Text("GAME OVER", "50px Arial", "#00FFFF");
      u_suck = new createjs.Text("you suck", "12px Arial", "#00FFFF");
      game_over.x = 100;
      game_over.y = 200;
      u_suck.x = 270;
      u_suck.y = 270;
      stage.addChild(game_over);
      stage.addChild(u_suck);
    }
    return stage.update();
  };

  init();

}).call(this);
