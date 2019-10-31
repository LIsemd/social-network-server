const path = require('path')

class HomeController {
	index(ctx) {}

	/**
	 *
	 * 上传图片
	 * @param {*} ctx
	 * @memberof HomeController
	 */
	upload(ctx) {
		const file = ctx.request.files.file
		// 获取图片名
		const basename = path.basename(file.path)
		ctx.body = { url: `${ctx.origin}/uploads/${basename}`}
	}
}


module.exports = new HomeController();