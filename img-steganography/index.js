var ImageColorMask = function(colors, opts){
	opts.debug = opts.debug ? opts.debug : false;
	this.colors = colors;
	var offset = 0;

    
	var getBit = function(number, location) {      
        // 右移locaton位  AND 1 
	   return ((number >> location) & 1);
    };
    
	var setBit = function(number, location, bit) {
		return (number & ~(1 << location)) | (bit << location);
    };
    
    // 从每个字符二进制数中遍历获得字节
	var getBitsFromNumber = function(number, size){
        // 8 8 ===> 0 0 0 1 0 0 0 0 
	   var bits = [];
	   for (var i = 0; i < size; i++) {
           var result = getBit(number, i);
		   bits.push(result);
       }
	   return bits;
	}

    /**
     * 
     *  @desc  修改了color  即Imgdata.data  
     *          修改了原像素信息
     * fileName.length, 8 
     * 字符串用，如filename 16 
     * data.length   24
     */

	this.writeNumber = function(number, size){
        // 将进制数转换为 size长的数组
		var bits = getBitsFromNumber(number, size);
		var pos = 0;
		var mix = 0;
		//if(opts.debug)console.log(bits.join(''));
		while(pos < bits.length && offset < this.colors.length){
            var result = setBit(this.colors[offset], mix++, bits[pos++]);
			this.colors[offset] = result;			
			while(mix < opts.mixCount && pos < bits.length){
                var result = setBit(this.colors[offset], mix++, bits[pos++]);
				this.colors[offset] = result;
			}
			if(opts.debug){
				for(var c=mix;c < 8;c++){
					this.colors[offset] = setBit(this.colors[offset], c, 0);
				}
			}
			offset ++;//R
			mix = 0;

			if((offset + 1) % 4 == 0){
				colors[offset] = 255;
				offset ++;
			}
		}
    }
    
	this.readNumber = function(size){		
		var bits = opts.debug ? [] : null;
		var pos = 0;
		var number = 0;
		var mix = 0;
		while(pos < size && offset < this.colors.length){
			var bit = getBit(this.colors[offset], mix++);
			number = setBit(number, pos++, bit);
			if(opts.debug)bits.push(bit);
			while(mix < opts.mixCount && pos < size){
				bit = getBit(this.colors[offset], mix++);
				number = setBit(number, pos++, bit);
				if(opts.debug)bits.push(bit);
			}

			offset ++;
			mix = 0;
			if((offset + 1) % 4 == 0){
				offset ++;
			}
		}		
		if(opts.debug)console.log(bits.join(''));
		return number;
	}
}
var ImageMask = function(opts){
	opts.debug = opts.debug ? opts.debug : false;
    opts.charSize = opts.charSize || 16; 
    //字符串用，如filename //字符的字节位数，默认为16，即字符最大值为0xFFFF
    opts.mixCount = opts.mixCount || 5; 
    //隐写数据要混合到图片颜色值里的最低位数，值范围在1-5，默认为2，如果大于3，则图片会失真很严重
    opts.lengthSize = opts.lengthSize || 24; 
    ////数据长度值的占用字节位数，默认为24，也即数据长度最大值为16777215

	if(opts.mixCount < 1)opts.mixCount = 1;
	// if(opts.mixCount > 5)opts.mixCount = 5;
	if(opts.charSize % opts.mixCount != 0)opts.charSize += opts.mixCount - (opts.charSize % opts.mixCount);
	if(opts.lengthSize % opts.mixCount != 0)opts.lengthSize += opts.mixCount - (opts.lengthSize % opts.mixCount);

	this.opts = opts;
}

ImageMask.prototype.maxTextLength = function(canvas){
	var ctx = canvas.getContext('2d');
	var pixelCount = ctx.canvas.width * ctx.canvas.height;
	return ((pixelCount * 3 * this.opts.mixCount) - this.opts.lengthSize) / this.opts.charSize;
}
ImageMask.prototype.maxFileSize = function(canvas){
	var ctx = canvas.getContext('2d');
	var pixelCount = ctx.canvas.width * ctx.canvas.height;
	return ((pixelCount * 3 * this.opts.mixCount) - 8 - this.opts.lengthSize - (255 * this.opts.charSize)) / 8;
}
ImageMask.prototype.hideFile = function(canvas, file, handler){
	var fileReader = new FileReader();
	var self = this;
	fileReader.addEventListener("loadend", function(event) {
		var data = new Uint8Array(event.target.result);
        var fileName = file.name;
		var ctx = canvas.getContext('2d');
		var pixelCount = ctx.canvas.width * ctx.canvas.height;
		if ((8 + fileName.length * self.opts.charSize + self.opts.lengthSize + data.length * 8) > (pixelCount * 3 * self.opts.mixCount)) {
			handler({success: false, message: '文件过大'});
		}else{
			var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
			var colorMask = new ImageColorMask(imgData.data, self.opts);
			colorMask.writeNumber(fileName.length, 8);
			for(var i=0; i<fileName.length; i++){
				colorMask.writeNumber(fileName.charCodeAt(i), self.opts.charSize);
			}

			colorMask.writeNumber(data.length, self.opts.lengthSize);
			for(var i=0; i<data.length; i++){
				colorMask.writeNumber(data[i], 8);
			}

			ctx.putImageData(imgData, 0, 0);
			handler({success: true});
		}
	});
    fileReader.readAsArrayBuffer(file);
}
ImageMask.prototype.revealFile = function(canvas){
	var ctx = canvas.getContext('2d');
	var pixelCount = ctx.canvas.width * ctx.canvas.height;
    var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	var colorMask = new ImageColorMask(imgData.data, this.opts);
	
	var fileNameLength = colorMask.readNumber(8);
	if ((8 + fileNameLength * this.opts.charSize) > (pixelCount * 3 * this.opts.mixCount)) {
		return null;
	}
	var fileName = [];
	for (var i = 0; i < fileNameLength; i++) {
		var code = colorMask.readNumber(this.opts.charSize);
		fileName.push(String.fromCharCode(code));
	}

	var fileLength = colorMask.readNumber(this.opts.lengthSize);

	if ((8 + fileNameLength * this.opts.charSize + this.opts.lengthSize + (fileLength * 8)) > (pixelCount * 3 * this.opts.mixCount)) {
		return null;
	}

	if (fileLength <= 0) {
		return null;
	}

	var buffer = new ArrayBuffer(fileLength);
	var data = new Uint8Array(buffer);
	for (var i = 0; i < fileLength; i++) {
		var b = colorMask.readNumber(8);
		data[i] = b;
	}
    return {name : fileName.join(''), data : data};
}
