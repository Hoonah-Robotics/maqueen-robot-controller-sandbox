input.onButtonPressed(Button.A, function () {
    if (lightsON) {
        lightsON = 0
    } else {
        lightsON = 1
    }
    while (input.buttonIsPressed(Button.A)) {
    	
    }
})
input.onButtonPressed(Button.AB, function () {
    if (soundON) {
        soundON = 0
    } else {
        soundON = 1
    }
    while (input.buttonIsPressed(Button.AB)) {
    	
    }
})
input.onButtonPressed(Button.B, function () {
    if (bubbleSort) {
        bubbleSort = 0
    } else {
        bubbleSort = 1
    }
    while (input.buttonIsPressed(Button.B)) {
    	
    }
})
radio.onReceivedValue(function (name, value) {
    comment.comment("SENSE: read accelerometer on driver station")
    comment.comment("range of values: -255 to 255; 0 = STOP")
    if (name == "y") {
        throttle = value
    } else if (name == "x") {
        turn = value
    }
})
let distance = 0
let sum = 0
let meanIndex = 0
let temp = 0
let blue = 0
let green = 0
let red = 0
let scalarRight = 0
let scalarLeft = 0
let vectorRight = 0
let vectorLeft = 0
let turn = 0
let throttle = 0
let bubbleSort = 0
let lightsON = 0
let soundON = 0
comment.comment("runtime configuration")
comment.comment("same radio group as driver station")
radio.setGroup(0)
radio.setTransmitPower(7)
soundON = 0
lightsON = 0
comment.comment("Options: 0=glowing RGB; 1=accel. controlled RGB ")
let RGBoption = 1
bubbleSort = 0
let dataSample1 = 10
comment.comment("END runtime configuration")
let ultrasonicData = [dataSample1]
let counter = 0
OLED12864_I2C.init()
OLED12864_I2C.printString("distance = ", 1, true)
OLED12864_I2C.printString("light track L-R = ", 1, true)
let strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB)
basic.showIcon(IconNames.Happy)
basic.forever(function () {
    comment.comment("THINK: calculate speed and direction for each motor")
    comment.comment("slow down turn without changing maximum drive speed")
    turn = turn / 3
    comment.comment("difference between left and right motor speeds")
    vectorLeft = throttle + turn
    vectorRight = throttle - turn
    comment.comment("Scale motor power from 0 to 255")
    scalarLeft = vectorLeft
    scalarRight = vectorRight
    comment.comment("ACT: send speed and direction to motors ")
    if (vectorLeft > 0) {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, vectorLeft)
    } else if (vectorLeft < 0) {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, Math.abs(vectorLeft))
    } else {
        maqueen.motorStop(maqueen.Motors.M1)
    }
    if (vectorRight > 0) {
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, vectorRight)
    } else if (vectorRight < 0) {
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, Math.abs(vectorRight))
    } else {
        maqueen.motorStop(maqueen.Motors.M2)
    }
})
basic.forever(function () {
    comment.comment("Option 0: glowing RGB leds")
    while (lightsON) {
        while (RGBoption) {
            red = 0
            green = 0
            blue = 255
            for (let index = 0; index < 255; index++) {
                red += 1
                blue += -1
                strip.showColor(neopixel.rgb(red, green, blue))
                basic.pause(1)
            }
            for (let index = 0; index < 255; index++) {
                green += 1
                red += -1
                strip.showColor(neopixel.rgb(red, green, blue))
                basic.pause(1)
            }
            for (let index = 0; index < 255; index++) {
                blue += 1
                green += -1
                strip.showColor(neopixel.rgb(red, green, blue))
                basic.pause(1)
            }
        }
    }
    strip.showColor(neopixel.colors(NeoPixelColors.Black))
})
basic.forever(function () {
    comment.comment("Option 1: accelerometer controls RGB colors")
    while (lightsON) {
        while (RGBoption) {
            red = input.acceleration(Dimension.X) / 2
            green = input.acceleration(Dimension.Y) / 2
            blue = 0 - input.acceleration(Dimension.Z) / 2
            strip.shift(1)
            strip.setPixelColor(0, neopixel.rgb(red, green, blue))
            strip.show()
            basic.pause(100)
        }
    }
})
basic.forever(function () {
    if (bubbleSort) {
        comment.comment("read ultrasonic")
        for (let index = 0; index <= dataSample1; index++) {
            ultrasonicData[index] = maqueen.Ultrasonic(PingUnit.Centimeters)
        }
        comment.comment("bubblesort readings")
        counter = 1
        while (counter > 0) {
            counter = 0
            for (let index = 0; index <= dataSample1 - 1; index++) {
                if (ultrasonicData[index] > ultrasonicData[index] + 1) {
                    temp = ultrasonicData[index]
                    ultrasonicData[index] = ultrasonicData[index] + 1
                    ultrasonicData[index + 1] = temp
                    counter += 1
                }
            }
        }
        comment.comment("average middle 3 readings")
        comment.comment("meanIndex must be an integer, so round!")
        meanIndex = Math.round(dataSample1 / 2)
        sum = ultrasonicData[meanIndex - 1]
        sum = sum + ultrasonicData[meanIndex]
        sum = sum + ultrasonicData[meanIndex + 1]
        distance = sum / 3
    } else {
        distance = (maqueen.Ultrasonic(PingUnit.Centimeters) + distance) / 2
    }
    OLED12864_I2C.String("    ", 65, 0, 1)
    OLED12864_I2C.Number(Math.round(distance), 65, 0, 1)
})
basic.forever(function () {
    OLED12864_I2C.Number(maqueen.readPatrol(maqueen.Patrol.PatrolLeft), 105, 1, 1)
    OLED12864_I2C.Number(maqueen.readPatrol(maqueen.Patrol.PatrolRight), 115, 1, 1)
})
basic.forever(function () {
    while (lightsON) {
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOn)
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
        if (soundON) {
            music.playTone(587, music.beat(BeatFraction.Whole))
            basic.pause(100)
        } else {
            basic.pause(200)
        }
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOn)
        if (soundON) {
            music.playTone(440, music.beat(BeatFraction.Whole))
            basic.pause(100)
        } else {
            basic.pause(200)
        }
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
    }
})
