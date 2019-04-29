let canvas=document.getElementById('game'),
	weaponSlotCanvas=document.getElementById('weapon-slot-canvas'),
	buyWeaponCanvas=document.getElementById('buy-weapon-canvas')


canvas.width=window.innerWidth
canvas.height=window.innerHeight

let imgNames=[
	'kid',
	'adult',
	'senior',
	'slime',
	'bat',
	'zombie',
	'wall',
	'stair_down',
	'stair_up',
	'sword',
	'knife',
	'shopkeeper',
	'fist'
]

let imgs={}

function loadImgs(fn,i=0){
	let img=new Image()

	img.onload=function(i,fn){
		return function(){
			if(i+1<imgNames.length){
				loadImgs(fn,i+1)
			}else{
				fn()
			}
		}
	}(i,fn)

	img.src='/static/ld44/'+imgNames[i]+'.png'
	imgs[imgNames[i]]=img
}


function GameObj(){}
GameObj.prototype={
	x:0,
	y:0,
	spriteName:'',
	tick:function(){},
	draw:function(ctx){
		ctx.save()
		ctx.translate(this.x*100,this.y*100)
	
		ctx.save()
		ctx.translate(-300,-200)
		ctx.drawImage(imgs[this.spriteName],0,0)
		ctx.restore()

	//	ctx.strokeRect(0,0,100,100)
		ctx.restore()
	}
}

function Shopkeeper(){
	let weapons=[
		new Knife,
		new Sword
	]
	this.weapon=weapons[Math.floor(Math.random()*weapons.length)]
}
Shopkeeper.prototype=Object.create(GameObj.prototype)
Object.assign(Shopkeeper.prototype,{
	spriteName:'shopkeeper',
	healCount:0,
	repairCount:0,
	buyWeaponCount:0,
	weapon:null
})

function Weapon(){
	this.maxHp=10+Math.round(Math.random()*50)
	this.hp=Math.round(Math.random()*this.maxHp)
}
Weapon.prototype=Object.create(GameObj.prototype)
Object.assign(Weapon.prototype,{
	spriteName:'unknown_weapon',
	str:1,
	dex:1,
	agi:1,
	vit:1,
	hp:100,
	maxHp:100
})

function Sword(){
	Weapon.call(this)
	}
Sword.prototype=Object.create(Weapon.prototype)
Object.assign(Sword.prototype,{
	spriteName:'sword'
})

function Knife(){
	Weapon.call(this)
	}
Knife.prototype=Object.create(Weapon.prototype)
Object.assign(Knife.prototype,{
	spriteName:'knife'
})


function Wall(){}
Wall.prototype=Object.create(GameObj.prototype)
Object.assign(Wall.prototype,{
	spriteName:'wall'
})

function StairUp(){}
StairUp.prototype=Object.create(GameObj.prototype)
Object.assign(StairUp.prototype,{
	spriteName:'stair_up'
})

function StairDown(){}
StairDown.prototype=Object.create(GameObj.prototype)
Object.assign(StairDown.prototype,{
	spriteName:'stair_down'
})

function Monster(){}
Monster.prototype=Object.create(GameObj.prototype)
Object.assign(Monster.prototype,{
	str:1,
	dex:0,
	agi:0,
	vit:0,
	hp:5,
	tick:function(){
		let x2=this.x+Math.round(Math.random()*2-1),
			y2=this.y+Math.round(Math.random()*2-1),
			canMove=true

		for(let i=0;i<map.gameObjs.length;i++){
			let gameObj=map.gameObjs[i]
			if(gameObj.x==x2&&gameObj.y==y2){
				canMove=false
				if(gameObj instanceof Hero){
					gameObj.hp-=this.str
				}
			}
		}

		if(canMove){
			this.x=x2
			this.y=y2
		}

	}
})

function Slime(){}
Slime.prototype=Object.create(Monster.prototype)
Object.assign(Slime.prototype,{
	spriteName:'slime'
})

function Bat(){}
Bat.prototype=Object.create(Monster.prototype)
Object.assign(Bat.prototype,{
	spriteName:'bat'
})

function Zombie(){}
Zombie.prototype=Object.create(Monster.prototype)
Object.assign(Zombie.prototype,{
	spriteName:'zombie'
})

function Hero(){}
Hero.prototype=Object.create(Monster.prototype)
Object.defineProperties(Hero.prototype,{
	'agePts':{
		get:function(){
			let pts=0
			if(this.life>500){
				pts+=1000-this.life
			}else{
				pts+=this.life
			}
			pts/=10
		
			return pts
		}
	},
	'str':{
		get:function(){
			if(this.weapon){
				return this.agePts*this.weapon.str
			}
			return this.agePts
		}
	},
	'dex':{
		get:function(){
			if(this.weapon){
				return this.agePts*this.weapon.dex
			}
			return this.agePts
		}
	},
	'agi':{
		get:function(){
			if(this.weapon){
				return this.agePts*this.weapon.agi
			}
			return this.agePts
		}
	},
	'vit':{
		get:function(){
			if(this.weapon){
				return this.agePts*this.weapon.vit
			}
			return this.agePts
		}
	},
	'maxHp':{
		get:function(){
			return Math.ceil(5+this.vit)
		}
	}
})
Object.assign(Hero.prototype,{
	life:1000,
	spriteName:'kid',
	dx:0,
	dy:0,
	weapon:new Sword,
	tick:function(){
		let x2=this.x+this.dx,
			y2=this.y+this.dy,
			canMove=true
			isWall=false

		for(let i=0;i<map.gameObjs.length;i++){
			let gameObj=map.gameObjs[i]
			if(gameObj.x==x2&&gameObj.y==y2){
				canMove=false
				if(gameObj instanceof Monster){
					gameObj.hp-=this.str

					if(gameObj.hp<=0){
						map.gameObjs.splice(i,1)
						if(Math.random()>.5){
							let weapon=new Knife
							weapon.x=gameObj.x
							weapon.y=gameObj.y
							map.gameObjs.push(weapon)
						}
					}
					if(this.weapon){
						this.weapon.hp--
						if(this.weapon.hp<=0){
							this.weapon=null
						}
					}
				}else if(gameObj instanceof Wall){
					isWall=true
				}else if(gameObj instanceof StairDown){
					if(maps.length==currentDungeonLvl){
						let nextMap=new Map
						nextMap.genRoom(false,false,true)
						for(let j=0;j<maps.length+4;j++){
							if(j==maps.length+3){
								nextMap.genRoom(true)
							}else if(j==maps.length+2){
								nextMap.genRoom(false,true)
							}else{
								nextMap.genRoom()
							}
						}
						nextMap.genMap()
						nextMap.gameObjs.push(this)
						maps.push(nextMap)
					}
					map=maps[currentDungeonLvl]	
					currentDungeonLvl++
	
					for(let j=0;j<map.gameObjs.length;j++){
						let gameObj=map.gameObjs[j]
						if(gameObj instanceof StairUp){
							this.x=gameObj.x
							this.y=gameObj.y
							break
						}
					}

				}else if(gameObj instanceof StairUp){
					currentDungeonLvl--
					map=maps[currentDungeonLvl-1]
					for(let j=0;j<map.gameObjs.length;j++){
						let gameObj=map.gameObjs[j]
						if(gameObj instanceof StairDown){
							this.x=gameObj.x
							this.y=gameObj.y
							break
						}
					}

				}else if(gameObj instanceof Weapon||gameObj instanceof Shopkeeper){
					canMove=true
				}

				break
			}
		}

		if(canMove){
			this.x=x2
			this.y=y2
		}

		if(!isWall){
			this.life--
			if(this.life<800){
				this.spriteName='adult'
				if(this.life<200){
					this.spriteName='senior'
				}
			}
		}
		
		if(this.hp<this.maxHp){ 
			this.hp++
		}
	}
})

function Room(){
	this.corridors=[]
	this.availableCorridors=['n','s','e','w']
	this.w=5+Math.round(Math.random()*2)
	this.l=5+Math.round(Math.random()*2)
	this.gameObjs=[]
}
Room.prototype={
	x:0,
	y:0,
	w:0,
	l:0,
	availableCorridors:[],
	corridors:[],
	addGameObj:function(gameObj){//check for collision
		gameObj.x=this.x+2+Math.floor((this.w-2)*Math.random())
		gameObj.y=this.y+2+Math.floor((this.l-2)*Math.random())
		this.gameObjs.push(gameObj)
	},
	genMonster:function(){
		let monster
		if(Math.random()>.5){
			monster=new Slime
		}else if(Math.random()>.5){
			monster=new Bat
		}else if(true||Math.random()>.5){
			monster=new Zombie
		}
		this.addGameObj(monster)
	}
}

function Map(){
	this.rooms=[]
	this.corridors=[]
	this.gameObjs=[]
}
Map.prototype={
	rooms:[],
	corridors:[],
	gameObjs:[],
	genRoom:function(hasStairDown,hasShopkeeper,hasStairUp){
		if(this.rooms.length){
			let choices=[]
			for(let i=0;i<this.rooms.length;i++){
				choices.push(this.rooms[i])
			}
			do{
				let room=choices.splice(Math.floor(choices.length*Math.random()),1)[0]
				if(room.corridors.length<4){
					let direction=room.availableCorridors.splice(Math.floor(room.availableCorridors.length*Math.random()),1)[0]
					let corridor=new Room(),
						oppositeDirection='',
						room2=new Room()

//FIXME Make sure new corridor and room doesn't collide with existing corridors and room
//FIXME Just remove ALL gameobjs inside a corridor
					switch(direction){
						case 'n':
							corridor.w=2
							corridor.l=3+Math.round(Math.random()*2)
							corridor.x=Math.floor(room.x+Math.random()*(room.w-2))
							corridor.y=room.y-corridor.l
							oppositeDirection='s'
							room2.x=corridor.x-Math.floor(Math.random()*(room2.w-2))
							room2.y=corridor.y-room2.l
							break
						case 's':
							corridor.w=2
							corridor.l=3+Math.round(Math.random()*2)
							corridor.x=Math.floor(room.x+Math.random()*(room.w-2))
							corridor.y=room.y+room.l
							oppositeDirection='n'
							room2.x=corridor.x-Math.floor(Math.random()*(room2.w-2))
							room2.y=corridor.y+corridor.l
							break
						case 'w':
							corridor.w=3+Math.round(Math.random()*2)
							corridor.l=2
							corridor.x=room.x-corridor.w
							corridor.y=Math.floor(room.y+Math.random()*(room.l-2))
							oppositeDirection='e'
							room2.x=corridor.x-room2.w
							room2.y=corridor.y-Math.floor(Math.random()*(room2.l-2))
							break
						case 'e':
							corridor.w=3+Math.round(Math.random()*2)
							corridor.l=2
							corridor.x=room.x+room.w
							corridor.y=Math.floor(room.y+Math.random()*(room.l-2))
							oppositeDirection='w'
							room2.x=corridor.x+corridor.w
							room2.y=corridor.y-Math.floor(Math.random()*(room2.l-2))
							break
					}
					room.corridors.push(corridor)
					this.corridors.push(corridor)
					
					for(let i=0;i<room2.availableCorridors.length;i++){
						if(room2.availableCorridors[i]==oppositeDirection){
							room2.availableCorridors.splice(i,1)
							break
						}
					}
				
					let monsterCount=Math.ceil(Math.random()*3)
					for(let i=0;i<monsterCount;i++){
						room2.genMonster()
					}
					this.rooms.push(room2)
					if(hasStairDown){
						room2.addGameObj(new StairDown)
					}
					if(hasShopkeeper){
						room2.addGameObj(new Shopkeeper)
					}
				
					break
				}
			}while(choices.length)

		}else{
			let room=new Room
			this.rooms.push(room)
			if(hasStairUp){
				room.addGameObj(new StairUp)
			}
		}
	},
	genMap:function(){
		for(let i=0;i<this.rooms.length;i++){
			let room=this.rooms[i]
			for(let j=0;j<=room.w;j++){
				let wall=new Wall
				wall.x=room.x+j
				wall.y=room.y
				this.gameObjs.push(wall)

				wall=new Wall
				wall.x=room.x+j
				wall.y=room.y+room.l
				this.gameObjs.push(wall)

			}

			for(let j=1;j<room.l;j++){
				let wall=new Wall
				wall.x=room.x
				wall.y=room.y+j
				this.gameObjs.push(wall)

				wall=new Wall
				wall.x=room.x+room.w
				wall.y=room.y+j
				this.gameObjs.push(wall)

			}

			for(let j=0;j<room.gameObjs.length;j++){
				this.gameObjs.push(room.gameObjs[j])
			}
		}

		for(let i=0;i<this.rooms.length;i++){
			let room=this.rooms[i]
			
			for(let j=0;j<this.gameObjs.length;j++){
				let gameObj=this.gameObjs[j]
				if(gameObj instanceof Wall
					&&gameObj.x>room.x&&gameObj.x<room.x+room.w
					&&gameObj.y>room.y&&gameObj.y<room.y+room.l
				){
					this.gameObjs.splice(j,1)
					j--
				}
			}
		}

		for(let i=0;i<this.corridors.length;i++){
			let corridor=this.corridors[i]
			for(let j=0;j<=corridor.w;j++){
				let wall=new Wall
				wall.x=corridor.x+j
				wall.y=corridor.y
				this.gameObjs.push(wall)

				wall=new Wall
				wall.x=corridor.x+j
				wall.y=corridor.y+corridor.l
				this.gameObjs.push(wall)

			}

			for(let j=1;j<corridor.l;j++){
				let wall=new Wall
				wall.x=corridor.x
				wall.y=corridor.y+j
				this.gameObjs.push(wall)

				wall=new Wall
				wall.x=corridor.x+corridor.w
				wall.y=corridor.y+j
				this.gameObjs.push(wall)
			}
		
			if(corridor.w<corridor.l){
				for(let j=0;j<this.gameObjs.length;j++){
					let gameObj=this.gameObjs[j]
					if(gameObj.x==corridor.x+1&&gameObj.y>=corridor.y&&gameObj.y<=corridor.y+corridor.l){
						this.gameObjs.splice(j,1)
						j--
					}
				
				}
			}else{
				for(let j=0;j<this.gameObjs.length;j++){
					let gameObj=this.gameObjs[j]
					if(gameObj.x>=corridor.x&&gameObj.x<=corridor.x+corridor.w&&gameObj.y==corridor.y+1){
						this.gameObjs.splice(j,1)
						j--
					}


				}

			}
		
		
		}
	}
}

let	hero=new Hero,
	ctx=canvas.getContext('2d'),
	map=new Map,
	maps=[map],
	currentDungeonLvl=1,
	weaponSlotCtx=weaponSlotCanvas.getContext('2d')
	buyWeaponCtx=buyWeaponCanvas.getContext('2d')

map.genRoom()
map.genRoom()
map.genRoom(false,true)
map.genRoom(true)
map.genMap()


hero.x=1
hero.y=1

ctx.imageSmoothingEnabled=false
ctx.translate(.5,0)

map.gameObjs.push(hero);

function tick(){
	for(let i=0;i<map.gameObjs.length;i++){
		map.gameObjs[i].tick()
	}
}
let bottomUI=document.getElementById('bottom-ui'),
	pickUpButton=document.getElementById('pick-up-button'),
	shopButton=document.getElementById('shop-button'),
	shopMenuDiv=document.getElementById('shop-menu'),
	healBtn=document.getElementById('heal-btn'),
	repairBtn=document.getElementById('repair-btn'),
	buyWeaponBtn=document.getElementById('buy-weapon-btn'),
	hpSpan=document.getElementById('hp'),
	maxHpSpan=document.getElementById('max-hp'),
	lifeSpan=document.getElementById('life'),
	maxLifeSpan=document.getElementById('max-life'),
	durabilitySpan=document.getElementById('weapon-durability'),
	maxDurabilitySpan=document.getElementById('max-weapon-durability')
	durabilityDiv=document.getElementById('durability-div')

pickUpButton.addEventListener('click',function(){
	for(let i=0;map.gameObjs.length;i++){
		let gameObj=map.gameObjs[i]
		if(gameObj.x==hero.x&&gameObj.y==hero.y&&gameObj instanceof Weapon){
			if(hero.weapon){
				hero.weapon.x=hero.x
				hero.weapon.y=hero.y
				hero.weapon=map.gameObjs.splice(i,1,hero.weapon)[0]
			}else{
				hero.weapon=map.gameObjs.splice(i,1)[0]
			}
			break
		}
	}
	draw()
})

buyWeaponCtx.translate(-300,-200)
let shopkeeper

shopButton.addEventListener('click',function(){
	shopMenuDiv.style.display=shopMenuDiv.style.display=='block'?'none':'block'
	for(let i=0;i<map.gameObjs.length;i++){
		let gameObj=map.gameObjs[i]
		if(hero.x==gameObj.x&&hero.y==gameObj.y&&gameObj instanceof Shopkeeper){
			shopkeeper=gameObj
			break
		}
	}
	buyWeaponCtx.clearRect(0,0,100,100)

	if(shopkeeper.weapon){
		console.log('display weapon')
		buyWeaponCtx.drawImage(imgs[shopkeeper.weapon.spriteName],0,0)
		buyWeaponBtn.disabled=false
	}else{
		buyWeaponBtn.disabled=true
	}

	healBtn.disabled=hero.hp==hero.maxHp
	repairBtn.disabled=hero.weapon.hp==hero.weapon.maxHp
})

healBtn.addEventListener('click',function(){
	hero.life-=Shopkeeper.prototype.healCount
	Shopkeeper.prototype.healCount++
	healBtn.innerText='Heal (Costs '+(Shopkeeper.prototype.healCount)+' life pts)'
	hero.hp=hero.maxHp
	healBtn.disabled=hero.hp==hero.maxHp
	draw()
})

repairBtn.addEventListener('click',function(){
	hero.life-=Shopkeeper.prototype.repairCount
	Shopkeeper.prototype.repairCount++
	repairBtn.innerText='Repair (Costs '+(Shopkeeper.prototype.repairCount)+' life pts)'
	hero.weapon.hp=hero.weapon.maxHp
	repairBtn.disabled=hero.weapon.hp==hero.weapon.maxHp
	draw()
})

buyWeaponBtn.addEventListener('click',function(){
	hero.life-=Shopkeeper.prototype.buyWeaponCount

	hero.weapon.x=hero.x
	hero.weapon.y=hero.y
	map.gameObjs.push(hero.weapon)

	hero.weapon=shopkeeper.weapon
	shopkeeper.weapon=null
	buyWeaponCtx.clearRect(300,200,100,100)

	Shopkeeper.prototype.buyWeaponCount++
	buyWeaponBtn.innerText='Buy Weapon (Costs '+(Shopkeeper.prototype.buyWeaponCount)+' life pts)'
	buyWeaponBtn.disabled=true
	draw()
})


weaponSlotCtx.translate(-300,-200)
function draw(){
	ctx.clearRect(0,0,window.innerWidth,window.innerHeight)
	ctx.save()
	ctx.translate(window.innerWidth/2-hero.x*100,window.innerHeight/2-hero.y*100)
	pickUpButton.disabled=true
	shopButton.disabled=true
	for(let i=0;i<map.gameObjs.length;i++){
		let gameObj=map.gameObjs[i]
		gameObj.draw(ctx)
		if(hero.x==gameObj.x&&hero.y==gameObj.y){
			if(gameObj instanceof Weapon){
				pickUpButton.disabled=false
			}
			if(gameObj instanceof Shopkeeper){
				shopButton.disabled=false
			}
		}
	}

	if(shopButton.disabled){
		shopMenuDiv.style.display='none'
	}
	ctx.restore()

	weaponSlotCtx.clearRect(300,200,100,100)
	if(hero.weapon){
		weaponSlotCtx.drawImage(imgs[hero.weapon.spriteName],0,0)
	}else{
		weaponSlotCtx.drawImage(imgs.fist,0,0)
	}

	hpSpan.innerText=hero.hp
	maxHpSpan.innerText=hero.maxHp
	lifeSpan.innerText=hero.life

	if(hero.weapon){
		durabilityDiv.style.display='block'
		durabilitySpan.innerText=hero.weapon.hp
		maxDurabilitySpan.innerText=hero.weapon.maxHp
	}else{
		durabilityDiv.style.display='none'
	}
}

canvas.addEventListener('mousedown',function(e){
	let a=Math.atan2(e.clientY-canvas.height/2-50,e.clientX-canvas.width/2-50)
	hero.dx=Math.round(Math.cos(a))
	hero.dy=Math.round(Math.sin(a))
	tick()
	draw()
})

loadImgs(draw)
