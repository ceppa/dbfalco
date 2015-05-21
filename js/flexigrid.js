jQuery.browser = {};
(function () {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
})();

(function (e) {
	e.addFlex = function (t, n) {
		if (t.grid) return false;
		n = e.extend({
			height: 200,
			width: "auto",
			striped: true,
			novstripe: false,
			minwidth: 30,
			minheight: 80,
			resizable: true,
			url: false,
			method: "POST",
			dataType: "xml",
			errormsg: "Connection Error",
			usepager: false,
			nowrap: true,
			page: 1,
			total: 1,
			useRp: true,
			rp: 40,
			rpOptions: [20, 40, 60, 80, 100],
			title: false,
			selectedItem:false,
			pagestat: "Displaying {from} to {to} of {total} items",
			procmsg: "Processing, please wait ...",
			query: "",
			qtype: "",
			nomsg: "No items",
			minColToggle: 1,
			showToggleBtn: true,
			hideOnSubmit: true,
			autoload: true,
			blockOpacity: .5,
			onToggleCol: false,
			onChangeSort: false,
			onSuccess: false,
			onRowSelected: false,
			onRowSelectedClick: false,
			onRowDeselected: false,
			onNumRowsChange: false,
			onSubmit: false,
			onDragStart: false,
			onDragEnd: false
		}, n);
		e(t).show().attr({
			cellPadding: 0,
			cellSpacing: 0,
			border: 0
		}).removeAttr("width");
		var r = {
			hset: {},
			rePosDrag: function () {
				var t = 0 - this.hDiv.scrollLeft;
				if (this.hDiv.scrollLeft > 0) t -= Math.floor(n.cgwidth / 2);
				e(r.cDrag).css({
					top: r.hDiv.offsetTop + 1
				});
				var i = this.cdpad;
				e("div", r.cDrag).hide();
				e("thead tr:first th:visible", this.hDiv).each(function () {
					var s = e("thead tr:first th:visible", r.hDiv).index(this);
					var o = parseInt(e("div", this).width());
					var u = o;
					if (t == 0) t -= Math.floor(n.cgwidth / 2);
					o = o + t + i;
					e("div:eq(" + s + ")", r.cDrag).css({
						left: o + "px"
					}).show();
					t = o
				})
			},
			fixHeight: function (t) {
				t = false;
				if (!t) t = e(r.bDiv).height();
				var i = e(this.hDiv).height();
				e("div", this.cDrag).each(function () {
					e(this).height(t + i)
				});
				var s = parseInt(e(r.nDiv).height());
				if (s > t) e(r.nDiv).height(t).width(200);
				else e(r.nDiv).height("auto").width("auto");
				e(r.block).css({
					height: t,
					marginBottom: t * -1
				});
				var o = r.bDiv.offsetTop + t;
				if (n.height != "auto" && n.resizable) o = r.vDiv.offsetTop;
				e(r.rDiv).css({
					height: o
				})
			},
			dragStart: function (t, i, s) {
				if (t == "colresize") {
					e(r.nDiv).hide();
					e(r.nBtn).hide();
					var o = e("div", this.cDrag).index(s);
					var u = e("th:visible div:eq(" + o + ")", this.hDiv).width();
					e(s).addClass("dragging").siblings().hide();
					e(s).prev().addClass("dragging").show();
					this.colresize = {
						startX: i.pageX,
						ol: parseInt(s.style.left),
						ow: u,
						n: o
					};
					e("body").css("cursor", "col-resize")
				} else if (t == "vresize") {
					var a = false;
					e("body").css("cursor", "row-resize");
					if (s) {
						a = true;
						e("body").css("cursor", "col-resize")
					}
					this.vresize = {
						h: n.height,
						sy: i.pageY,
						w: n.width,
						sx: i.pageX,
						hgo: a
					}
				} else if (t == "colMove") {
					e(r.nDiv).hide();
					e(r.nBtn).hide();
					this.hset = e(this.hDiv).offset();
					this.hset.right = this.hset.left + e("table", this.hDiv).width();
					this.hset.bottom = this.hset.top + e("table", this.hDiv).height();
					this.dcol = s;
					this.dcoln = e("th", this.hDiv).index(s);
					this.colCopy = document.createElement("div");
					this.colCopy.className = "colCopy";
					this.colCopy.innerHTML = s.innerHTML;
					if (e.browser.msie) {
						this.colCopy.className = "colCopy ie"
					}
					e(this.colCopy).css({
						position: "absolute",
						"float": "left",
						display: "none",
						textAlign: s.align
					});
					e("body").append(this.colCopy);
					e(this.cDrag).hide()
				}
				e("body").noSelect();
				if (n.onDragStart) 
				{
					var i = n.onDragStart();
					if (!i) return false
				}
			},
			dragMove: function (t) {
				alert("ou");
				if (this.colresize) {
					var r = this.colresize.n;
					var i = t.pageX - this.colresize.startX;
					var s = this.colresize.ol + i;
					var o = this.colresize.ow + i;
					if (o > n.minwidth) {
						e("div:eq(" + r + ")", this.cDrag).css("left", s);
						this.colresize.nw = o
					}
				} else if (this.vresize) {
					var u = this.vresize;
					var a = t.pageY;
					var i = a - u.sy;
					if (!n.defwidth) n.defwidth = n.width;
					if (n.width != "auto" && !n.nohresize && u.hgo) {
						var f = t.pageX;
						var l = f - u.sx;
						var c = u.w + l;
						if (c > n.defwidth) {
							this.gDiv.style.width = c + "px";
							n.width = c
						}
					}
					var h = u.h + i;
					if ((h > n.minheight || n.height < n.minheight) && !u.hgo) {
						this.bDiv.style.height = h + "px";
						n.height = h;
						this.fixHeight(h)
					}
					u = null
				} else if (this.colCopy) {
					e(this.dcol).addClass("thMove").removeClass("thOver");
					if (t.pageX > this.hset.right || t.pageX < this.hset.left || t.pageY > this.hset.bottom || t.pageY < this.hset.top) {
						e("body").css("cursor", "move")
					} else e("body").css("cursor", "pointer");
					e(this.colCopy).css({
						top: t.pageY + 10,
						left: t.pageX + 20,
						display: "block"
					})
				}
			},
			dragEnd: function () {
				if (this.colresize) {
					var t = this.colresize.n;
					var n = this.colresize.nw;
					e("th:visible div:eq(" + t + ")", this.hDiv).css("width", n);
					e("tr", this.bDiv).each(function () {
						e("td:visible div:eq(" + t + ")", this).css("width", n)
					});
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
					e("div:eq(" + t + ")", this.cDrag).siblings().show();
					e(".dragging", this.cDrag).removeClass("dragging");
					this.rePosDrag();
					this.fixHeight();
					this.colresize = false
				} else if (this.vresize) {
					this.vresize = false
				} else if (this.colCopy) {
					e(this.colCopy).remove();
					if (this.dcolt != null) {
						if (this.dcoln > this.dcolt) e("th:eq(" + this.dcolt + ")", this.hDiv).before(this.dcol);
						else e("th:eq(" + this.dcolt + ")", this.hDiv).after(this.dcol);
						this.switchCol(this.dcoln, this.dcolt);
						e(this.cdropleft).remove();
						e(this.cdropright).remove();
						this.rePosDrag()
					}
					this.dcol = null;
					this.hset = null;
					this.dcoln = null;
					this.dcolt = null;
					this.colCopy = null;
					e(".thMove", this.hDiv).removeClass("thMove");
					e(this.cDrag).show()
				}
				e("body").css("cursor", "default");
				e("body").noSelect(false);
			},
			toggleCol: function (i, s) {
				var o = e("th[axis='col" + i + "']", this.hDiv)[0];
				var u = e("thead th", r.hDiv).index(o);
				var a = e("input[value=" + i + "]", r.nDiv)[0];
				if (s == null) {
					s = o.hide
				}
				if (e("input:checked", r.nDiv).length < n.minColToggle && !s) return false;
				if (s) {
					o.hide = false;
					e(o).show();
					a.checked = true
				} else {
					o.hide = true;
					e(o).hide();
					a.checked = false
				}
				e("tbody tr", t).each(function () {
					if (s) e("td:eq(" + u + ")", this).show();
					else e("td:eq(" + u + ")", this).hide()
				});
				this.rePosDrag();
				if (n.onToggleCol) n.onToggleCol(i, s);
				return s
			},
			switchCol: function (n, r) {
				e("tbody tr", t).each(function () {
					if (n > r) e("td:eq(" + r + ")", this).before(e("td:eq(" + n + ")", this));
					else e("td:eq(" + r + ")", this).after(e("td:eq(" + n + ")", this))
				});
				if (n > r) e("tr:eq(" + r + ")", this.nDiv).before(e("tr:eq(" + n + ")", this.nDiv));
				else e("tr:eq(" + r + ")", this.nDiv).after(e("tr:eq(" + n + ")", this.nDiv)); if (e.browser.msie && e.browser.version < 7) e("tr:eq(" + r + ") input", this.nDiv)[0].checked = true;
				this.hDiv.scrollLeft = this.bDiv.scrollLeft
			},
			scroll: function () {
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				this.rePosDrag()
			},
			addData: function (s) {
				if (n.preProcess) s = n.preProcess(s);
				e(".pReload", this.pDiv).removeClass("loading");
				this.loading = false;
				if (!s) {
					e(".pPageStat", this.pDiv).html(n.errormsg);
					return false
				}
				if (n.dataType == "xml") n.total = +e("rows total", s).text();
				else n.total = s.total; if (n.total == 0) {
					e("tr, a, td, div", t).unbind();
					e(t).empty();
					n.pages = 1;
					n.page = 1;
					this.buildpager();
					e(".pPageStat", this.pDiv).html(n.nomsg);
					return false
				}
				n.pages = Math.ceil(n.total / n.rp);
				if (n.dataType == "xml") n.page = +e("rows page", s).text();
				else n.page = s.page;
				this.buildpager();
				var o = document.createElement("tbody");
				if (n.dataType == "json") {
					e.each(s.rows, function (t, i) {
						var s = document.createElement("tr");
						if((typeof(i.bgcolor)!=="undefined")&&(i.bgcolor.length>0))
							$(s).css("background-color",i.bgcolor);
						else
							if (t % 2 && n.striped) s.className = "erow";
						if (i.id) s.id = "row" + i.id;
						e("thead tr:first th", r.hDiv).each(function () {
							var t = document.createElement("td");
							var n = e(this).attr("axis").substr(3);
							t.align = this.align;
							t.innerHTML = i.cell[n];
							e(s).append(t);
							t = null
						});
						if (e("thead", this.gDiv).length < 1) {
							for (idx = 0; idx < cell.length; idx++) {
								var u = document.createElement("td");
								u.innerHTML = i.cell[idx];
								e(s).append(u);
								u = null
							}
						}
						e(o).append(s);
						s = null
					})
				} else if (n.dataType == "xml") {
					i = 1;
					e("rows row", s).each(function () {
						i++;
						var t = document.createElement("tr");
						if (i % 2 && n.striped) t.className = "erow";
						var s = e(this).attr("id");
						if (s) t.id = "row" + s;
						s = null;
						var u = this;
						e("thead tr:first th", r.hDiv).each(function () {
							var n = document.createElement("td");
							var r = e(this).attr("axis").substr(3);
							n.align = this.align;
							n.innerHTML = e("cell:eq(" + r + ")", u).text();
							e(t).append(n);
							n = null
						});
						if (e("thead", this.gDiv).length < 1) {
							e("cell", this).each(function () {
								var n = document.createElement("td");
								n.innerHTML = e(this).text();
								e(t).append(n);
								n = null
							})
						}
						e(o).append(t);
						t = null;
						u = null
					})
				}
				if (n.onSuccess) n.onSuccess();
				e("tr", t).unbind();
				e(t).empty();
				e(t).append(o);
				o = null;
				s = null;
				i = null;
				this.addCellProp();
				this.addRowProp();
				this.rePosDrag();
				if (n.hideOnSubmit) e(r.block).remove();
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				if (e.browser.opera) e(t).css("visibility", "visible")
			},
			changeSort: function (t) {
				if (this.loading) return true;
				e(r.nDiv).hide();
				e(r.nBtn).hide();
				if (n.sortname == e(t).attr("abbr")) {
					if (n.sortorder == "asc") n.sortorder = "desc";
					else n.sortorder = "asc"
				}
				e(t).addClass("sorted").siblings().removeClass("sorted");
				e(".sdesc", this.hDiv).removeClass("sdesc");
				e(".sasc", this.hDiv).removeClass("sasc");
				e("div", t).addClass("s" + n.sortorder);
				n.sortname = e(t).attr("abbr");
				if (n.onChangeSort) n.onChangeSort(n.sortname, n.sortorder);
				else this.populate()
			},
			buildpager: function () {
				e(".pcontrol input", this.pDiv).val(n.page);
				e(".pcontrol span", this.pDiv).html(n.pages);
				var t = (n.page - 1) * n.rp + 1;
				var r = t + n.rp - 1;
				if (n.total < r) r = n.total;
				var i = n.pagestat;
				i = i.replace(/{from}/, t);
				i = i.replace(/{to}/, r);
//				i = i.replace(/{total}/, n.total);
				i = i.replace(/{total}/, 'quindici');
				e(".pPageStat", this.pDiv).html(i);
				alert("ou");
			},
			populate: function () {
				if (this.loading) return true;
				if (n.onSubmit) {
					var i = n.onSubmit();
					if (!i) return false
				}
				this.loading = true;
				if (!n.url) return false;
				e(".pPageStat", this.pDiv).html(n.procmsg);
				e(".pReload", this.pDiv).addClass("loading");
				e(r.block).css({
					top: r.bDiv.offsetTop
				});
				if (n.hideOnSubmit) e(this.gDiv).prepend(r.block);
				if (e.browser.opera) e(t).css("visibility", "hidden");
				if (!n.newp) n.newp = 1;
				if (n.page > n.pages) n.page = n.pages;
				var s = [{
					name: "page",
					value: n.newp
				}, {
					name: "rp",
					value: n.rp
				}, {
					name: "sortname",
					value: n.sortname
				}, {
					name: "sortorder",
					value: n.sortorder
				}, {
					name: "query",
					value: n.query
				}, {
					name: "qtype",
					value: n.qtype
				}];
				if (n.params) {
					for (var o = 0; o < n.params.length; o++) s[s.length] = n.params[o]
				}
				e.ajax({
					type: n.method,
					url: n.url,
					data: s,
					dataType: n.dataType,
					success: function (e) {
						r.addData(e)
					},
					error: function (e) {
						try {
							if (n.onError) n.onError(e)
						} catch (t) {}
					}
				})
			},
			doSearch: function () {
				n.query = e("input[name=q]", r.sDiv).val();
				n.qtype = e("select[name=qtype]", r.sDiv).val();
				n.newp = 1;
				this.populate()
			},
			changePage: function (t) {
				if (this.loading) return true;
				switch (t) {
				case "first":
					n.newp = 1;
					break;
				case "prev":
					if (n.page > 1) n.newp = parseInt(n.page) - 1;
					break;
				case "next":
					if (n.page < n.pages) n.newp = parseInt(n.page) + 1;
					break;
				case "last":
					n.newp = n.pages;
					break;
				case "input":
					var r = parseInt(e(".pcontrol input", this.pDiv).val());
					if (isNaN(r)) r = 1;
					if (r < 1) r = 1;
					else if (r > n.pages) r = n.pages;
					e(".pcontrol input", this.pDiv).val(r);
					n.newp = r;
					break
				}
				if (n.newp == n.page) return false;
				if (n.onChangePage) n.onChangePage(n.newp);
				else this.populate()
			},
			addCellProp: function () {
				e("tbody tr td", r.bDiv).each(function () {
					var t = document.createElement("div");
					var i = e("td", e(this).parent()).index(this);
					var s = e("th:eq(" + i + ")", r.hDiv).get(0);
					if (s != null) {
						if (n.sortname == e(s).attr("abbr") && n.sortname) {
							this.className = "sorted"
						}
						e(t).css({
							textAlign: s.align,
							width: e("div:first", s)[0].style.width
						});
						if (s.hide) e(this).css("display", "none")
					}
					if (n.nowrap == false) e(t).css("white-space", "normal");
					if (this.innerHTML == "") this.innerHTML = " ";
					t.innerHTML = this.innerHTML;
					var o = e(this).parent()[0];
					var u = false;
					if (o.id) u = o.id.substr(3);
					if (s != null) {
						if (s.process) s.process(t, u)
					}
					e(this).empty().append(t).removeAttr("width")
				})
			},
			getCellDim: function (t) {
				var n = parseInt(e(t).height());
				var r = parseInt(e(t).parent().height());
				var i = parseInt(t.style.width);
				var s = parseInt(e(t).parent().width());
				var o = t.offsetParent.offsetTop;
				var u = t.offsetParent.offsetLeft;
				var a = parseInt(e(t).css("paddingLeft"));
				var f = parseInt(e(t).css("paddingTop"));
				return {
					ht: n,
					wt: i,
					top: o,
					left: u,
					pdl: a,
					pdt: f,
					pht: r,
					pwt: s
				}
			},
			addRowProp: function () {
				e("tbody tr", r.bDiv).each(function () {
					e(this).click(function (t) {
						var r = t.target || t.srcElement;
						if (r.href || r.type) return true;
						if (n.onRowSelectedClick && e(this).hasClass("trSelected")) {
							n.onRowSelectedClick(e(this)[0].id, e(this), e(this).parent().parent().parent())
						} else e(this).toggleClass("trSelected"); if (n.singleSelect) e(this).siblings().removeClass("trSelected");
						if (n.onRowSelected && e(this).hasClass("trSelected")) 
						{
							n.onRowSelected(e(this)[0].id, e(this), e(this).parent().parent().parent())
						}
						if (n.onRowDeselected && !e(this).hasClass("trSelected")) {
							n.onRowDeselected(e(this)[0].id, e(this), e(this).parent().parent().parent())
						}
						if(e(this).hasClass("trSelected"))
							n.selectedItem=e(this)[0].id;
						else
							n.selectedItem=false;

					}).mousedown(function (t) {
						if (t.shiftKey) {
							e(this).toggleClass("trSelected");
							r.multisel = true;
							this.focus();
							e(r.gDiv).noSelect()
						}
					}).mouseup(function () {
						if (r.multisel) {
							r.multisel = false;
							e(r.gDiv).noSelect(false)
						}
					}).hover(function (t) {
						if (r.multisel) {
							e(this).toggleClass("trSelected")
						}
					}, function () {});
					if (e.browser.msie && e.browser.version < 7) {
						e(this).hover(function () {
							e(this).addClass("trOver")
						}, function () {
							e(this).removeClass("trOver")
						})
					}
				})
			},
			pager: 0
		};
		if (n.colModel) {
			l = document.createElement("thead");
			tr = document.createElement("tr");
			for (i = 0; i < n.colModel.length; i++) {
				var s = n.colModel[i];
				var o = document.createElement("th");
				o.innerHTML = s.display;
				if (s.name && s.sortable) e(o).attr("abbr", s.name);
				e(o).attr("axis", "col" + i);
				if (s.align) o.align = s.align;
				if (s.width) e(o).attr("width", s.width);
				if (s.hide) {
					o.hide = true
				}
				if (s.process) {
					o.process = s.process
				}
				e(tr).append(o)
			}
			e(l).append(tr);
			e(t).prepend(l)
		}
		r.gDiv = document.createElement("div");
		r.mDiv = document.createElement("div");
		r.hDiv = document.createElement("div");
		r.bDiv = document.createElement("div");
		r.vDiv = document.createElement("div");
		r.rDiv = document.createElement("div");
		r.cDrag = document.createElement("div");
		r.block = document.createElement("div");
		r.nDiv = document.createElement("div");
		r.nBtn = document.createElement("div");
		r.iDiv = document.createElement("div");
		r.tDiv = document.createElement("div");
		r.sDiv = document.createElement("div");
		if (n.usepager) r.pDiv = document.createElement("div");
		r.hTable = document.createElement("table");
		r.gDiv.className = "flexigrid";
		if (n.width != "auto") r.gDiv.style.width = n.width + "px";
		if (e.browser.msie) e(r.gDiv).addClass("ie");
		if (n.novstripe) e(r.gDiv).addClass("novstripe");
		e(t).before(r.gDiv);
		e(r.gDiv).append(t);
		if (n.buttons) {
			r.tDiv.className = "tDiv";
			var u = document.createElement("div");
			u.className = "tDiv2";
			for (i = 0; i < n.buttons.length; i++) {
				var a = n.buttons[i];
				if (!a.separator) {
					var f = document.createElement("div");
					f.className = "fbutton";
					f.innerHTML = "<div><span>" + a.name + "</span></div>";
					if (a.bclass) e("span", f).addClass(a.bclass).css({
						paddingLeft: 20
					});
					f.onpress = a.onpress;
					f.name = a.name;
					if (a.onpress) {
						e(f).click(function () {
							this.onpress(this.name, r.gDiv)
						})
					}
					e(u).append(f);
					if (e.browser.msie && e.browser.version < 7) {
						e(f).hover(function () {
							e(this).addClass("fbOver")
						}, function () {
							e(this).removeClass("fbOver")
						})
					}
				} else {
					e(u).append("<div class='btnseparator'></div>")
				}
			}
			e(r.tDiv).append(u);
			e(r.tDiv).append("<div style='clear:both'></div>");
			e(r.gDiv).prepend(r.tDiv)
		}
		r.hDiv.className = "hDiv";
		e(t).before(r.hDiv);
		r.hTable.cellPadding = 0;
		r.hTable.cellSpacing = 0;
		e(r.hDiv).append('<div class="hDivBox"></div>');
		e("div", r.hDiv).append(r.hTable);
		var l = e("thead:first", t).get(0);
		if (l) e(r.hTable).append(l);
		l = null;
		if (!n.colmodel) var c = 0;
		e("thead tr:first th", r.hDiv).each(function () {
			var t = document.createElement("div");
			if (e(this).attr("abbr")) {
				e(this).click(function (t) {
					if (!e(this).hasClass("thOver")) return false;
					var n = t.target || t.srcElement;
					if (n.href || n.type) return true;
					r.changeSort(this)
				});
				if (e(this).attr("abbr") == n.sortname) {
					this.className = "sorted";
					t.className = "s" + n.sortorder
				}
			}
			if (this.hide) e(this).hide();
			if (!n.colmodel) {
				e(this).attr("axis", "col" + c++)
			}
			e(t).css({
				textAlign: this.align,
				width: this.width + "px"
			});
			t.innerHTML = this.innerHTML;
			e(this).empty().append(t).removeAttr("width").mousedown(function (e) {
				r.dragStart("colMove", e, this)
			}).hover(function () {
				if (!r.colresize && !e(this).hasClass("thMove") && !r.colCopy) e(this).addClass("thOver");
				if (e(this).attr("abbr") != n.sortname && !r.colCopy && !r.colresize && e(this).attr("abbr")) e("div", this).addClass("s" + n.sortorder);
				else if (e(this).attr("abbr") == n.sortname && !r.colCopy && !r.colresize && e(this).attr("abbr")) {
					var t = "";
					if (n.sortorder == "asc") t = "desc";
					else t = "asc";
					e("div", this).removeClass("s" + n.sortorder).addClass("s" + t)
				}
				if (r.colCopy) {
					var i = e("th", r.hDiv).index(this);
					if (i == r.dcoln) return false;
					if (i < r.dcoln) e(this).append(r.cdropleft);
					else e(this).append(r.cdropright);
					r.dcolt = i
				} else if (!r.colresize) {
					var s = e("th:visible", r.hDiv).index(this);
					var o = parseInt(e("div:eq(" + s + ")", r.cDrag).css("left"));
					var u = parseInt(e(r.nBtn).width()) + parseInt(e(r.nBtn).css("borderLeftWidth"));
					nl = o - u + Math.floor(n.cgwidth / 2);
					e(r.nDiv).hide();
					e(r.nBtn).hide();
					e(r.nBtn).css({
						left: nl,
						top: r.hDiv.offsetTop
					}).show();
					var a = parseInt(e(r.nDiv).width());
					e(r.nDiv).css({
						top: r.bDiv.offsetTop
					});
					if (nl + a > e(r.gDiv).width()) e(r.nDiv).css("left", o - a + 1);
					else e(r.nDiv).css("left", nl); if (e(this).hasClass("sorted")) e(r.nBtn).addClass("srtd");
					else e(r.nBtn).removeClass("srtd")
				}
			}, function () {
				e(this).removeClass("thOver");
				if (e(this).attr("abbr") != n.sortname) e("div", this).removeClass("s" + n.sortorder);
				else if (e(this).attr("abbr") == n.sortname) {
					var t = "";
					if (n.sortorder == "asc") t = "desc";
					else t = "asc";
					e("div", this).addClass("s" + n.sortorder).removeClass("s" + t)
				}
				if (r.colCopy) {
					e(r.cdropleft).remove();
					e(r.cdropright).remove();
					r.dcolt = null
				}
			})
		});
		r.bDiv.className = "bDiv";
		e(t).before(r.bDiv);
		e(r.bDiv).css({
			height: n.height == "auto" ? "auto" : n.height + "px"
		}).scroll(function (e) {
			r.scroll()
		}).append(t);
		if (n.height == "auto") {
			e("table", r.bDiv).addClass("autoht")
		}
		r.addCellProp();
		r.addRowProp();
		var h = e("thead tr:first th:first", r.hDiv).get(0);
		if (h != null) {
			r.cDrag.className = "cDrag";
			r.cdpad = 0;
			r.cdpad += isNaN(parseInt(e("div", h).css("borderLeftWidth"))) ? 0 : parseInt(e("div", h).css("borderLeftWidth"));
			r.cdpad += isNaN(parseInt(e("div", h).css("borderRightWidth"))) ? 0 : parseInt(e("div", h).css("borderRightWidth"));
			r.cdpad += isNaN(parseInt(e("div", h).css("paddingLeft"))) ? 0 : parseInt(e("div", h).css("paddingLeft"));
			r.cdpad += isNaN(parseInt(e("div", h).css("paddingRight"))) ? 0 : parseInt(e("div", h).css("paddingRight"));
			r.cdpad += isNaN(parseInt(e(h).css("borderLeftWidth"))) ? 0 : parseInt(e(h).css("borderLeftWidth"));
			r.cdpad += isNaN(parseInt(e(h).css("borderRightWidth"))) ? 0 : parseInt(e(h).css("borderRightWidth"));
			r.cdpad += isNaN(parseInt(e(h).css("paddingLeft"))) ? 0 : parseInt(e(h).css("paddingLeft"));
			r.cdpad += isNaN(parseInt(e(h).css("paddingRight"))) ? 0 : parseInt(e(h).css("paddingRight"));
			e(r.bDiv).before(r.cDrag);
			var p = e(r.bDiv).height();
			var d = e(r.hDiv).height();
			e(r.cDrag).css({
				top: -d + "px"
			});
			e("thead tr:first th", r.hDiv).each(function () {
				var t = document.createElement("div");
				e(r.cDrag).append(t);
				if (!n.cgwidth) n.cgwidth = e(t).width();
				e(t).css({
					height: p + d
				}).mousedown(function (e) {
					r.dragStart("colresize", e, this)
				});
				if (e.browser.msie && e.browser.version < 7) {
					r.fixHeight(e(r.gDiv).height());
					e(t).hover(function () {
						r.fixHeight();
						e(this).addClass("dragging")
					}, function () {
						if (!r.colresize) e(this).removeClass("dragging")
					})
				}
			})
		}
		if (n.striped) e("tbody tr:odd", r.bDiv).addClass("erow");
		if (n.resizable && n.height != "auto") {
			r.vDiv.className = "vGrip";
			e(r.vDiv).mousedown(function (e) {
				r.dragStart("vresize", e)
			}).html("<span></span>");
			e(r.bDiv).after(r.vDiv)
		}
		if (n.resizable && n.width != "auto" && !n.nohresize) {
			r.rDiv.className = "hGrip";
			e(r.rDiv).mousedown(function (e) {
				r.dragStart("vresize", e, true)
			}).html("<span></span>").css("height", e(r.gDiv).height());
			if (e.browser.msie && e.browser.version < 7) {
				e(r.rDiv).hover(function () {
					e(this).addClass("hgOver")
				}, function () {
					e(this).removeClass("hgOver")
				})
			}
			e(r.gDiv).append(r.rDiv)
		}
		if (n.usepager) {
			r.pDiv.className = "pDiv";
			r.pDiv.innerHTML = '<div class="pDiv2"></div>';
			e(r.bDiv).after(r.pDiv);
			var v = ' <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">Page <input type="text" size="4" value="1" /> of <span> 1 </span></span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
			e("div", r.pDiv).html(v);
			e(".pReload", r.pDiv).click(function () {
				r.populate()
			});
			e(".pFirst", r.pDiv).click(function () {
				r.changePage("first")
			});
			e(".pPrev", r.pDiv).click(function () {
				r.changePage("prev")
			});
			e(".pNext", r.pDiv).click(function () {
				r.changePage("next")
			});
			e(".pLast", r.pDiv).click(function () {
				r.changePage("last")
			});
			e(".pcontrol input", r.pDiv).keydown(function (e) {
				if (e.keyCode == 13) r.changePage("input")
			});
			if (e.browser.msie && e.browser.version < 7) e(".pButton", r.pDiv).hover(function () {
				e(this).addClass("pBtnOver")
			}, function () {
				e(this).removeClass("pBtnOver")
			});
			if (n.useRp) {
				var m = "";
				for (var g = 0; g < n.rpOptions.length; g++) {
					if (n.rp == n.rpOptions[g]) sel = 'selected="selected"';
					else sel = "";
					m += "<option value='" + n.rpOptions[g] + "' " + sel + " >" + n.rpOptions[g] + "  </option>"
				}
				e(".pDiv2", r.pDiv).prepend("<div class='pGroup'><select name='rp'>" + m + "</select></div> <div class='btnseparator'></div>");
				e("select", r.pDiv).change(function () {
					if (n.onRpChange) n.onRpChange(+this.value);
					else {
						n.newp = 1;
						n.rp = +this.value;
						r.populate()
					} if (n.onNumRowsChange) {
						n.onNumRowsChange(this.value)
					}
				})
			}
			if (n.searchitems) {
				e(".pDiv2", r.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
				e(".pSearch", r.pDiv).click(function () {
					e(r.sDiv).slideToggle("fast", function () {
						e(".sDiv:visible input:first", r.gDiv).trigger("focus")
					})
				});
				r.sDiv.className = "sDiv";
				sitems = n.searchitems;
				var y = "";
				for (var b = 0; b < sitems.length; b++) {
					if (n.qtype == "" && sitems[b].isdefault == true) {
						n.qtype = sitems[b].name;
						sel = 'selected="selected"'
					} else sel = "";
					y += "<option value='" + sitems[b].name + "' " + sel + " >" + sitems[b].display + "  </option>"
				}
				if (n.qtype == "") n.qtype = sitems[0].name;
				e(r.sDiv).append("<div class='sDiv2'>Quick Search <input type='text' size='30' name='q' class='qsbox' /> <select name='qtype'>" + y + "</select> <input type='button' value='Submit' /><input type='button' value='Clear' /></div>");
				e("input[name=q],select[name=qtype]", r.sDiv).keydown(function (e) {
					if (e.keyCode == 13) r.doSearch()
				});
				e("input[value=Submit]", r.sDiv).click(function () {
					r.doSearch()
				});
				e("input[value=Clear]", r.sDiv).click(function () {
					e("input[name=q]", r.sDiv).val("");
					n.query = "";
					r.doSearch()
				});
				e(r.bDiv).after(r.sDiv)
			}
		}
		e(r.pDiv, r.sDiv).append("<div style='clear:both'></div>");
		if (n.title) {
			r.mDiv.className = "mDiv";
			r.mDiv.innerHTML = '<div class="ftitle">' + n.title + "</div>";
			e(r.gDiv).prepend(r.mDiv);
			if (n.showTableToggleBtn) {
				e(r.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
				e("div.ptogtitle", r.mDiv).click(function () {
					e(r.gDiv).toggleClass("hideBody");
					e(this).toggleClass("vsble")
				})
			}
		}
		r.cdropleft = document.createElement("span");
		r.cdropleft.className = "cdropleft";
		r.cdropright = document.createElement("span");
		r.cdropright.className = "cdropright";
		r.block.className = "gBlock";
		var w = e(r.bDiv).height();
		var E = r.bDiv.offsetTop;
		e(r.block).css({
			width: r.bDiv.style.width,
			height: w,
			background: "white",
			position: "relative",
			marginBottom: w * -1,
			zIndex: 1,
			top: E,
			left: "0px"
		});
		e(r.block).fadeTo(0, n.blockOpacity);
		if (e("th", r.hDiv).length) {
			r.nDiv.className = "nDiv";
			r.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
			e(r.nDiv).css({
				marginBottom: w * -1,
				display: "none",
				top: E
			}).noSelect();
			var S = 0;
			e("th div", r.hDiv).each(function () {
				var t = e("th[axis='col" + S + "']", r.hDiv)[0];
				var n = 'checked="checked"';
				if (t.style.display == "none") n = "";
				e("tbody", r.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" ' + n + ' class="togCol" value="' + S + '" /></td><td class="ndcol2">' + this.innerHTML + "</td></tr>");
				S++
			});
			if (e.browser.msie && e.browser.version < 7) e("tr", r.nDiv).hover(function () {
				e(this).addClass("ndcolover")
			}, function () {
				e(this).removeClass("ndcolover")
			});
			e("td.ndcol2", r.nDiv).click(function () {
				if (e("input:checked", r.nDiv).length <= n.minColToggle && e(this).prev().find("input")[0].checked) return false;
				return r.toggleCol(e(this).prev().find("input").val())
			});
			e("input.togCol", r.nDiv).click(function () {
				if (e("input:checked", r.nDiv).length < n.minColToggle && this.checked == false) return false;
				e(this).parent().next().trigger("click")
			});
			e(r.gDiv).prepend(r.nDiv);
			e(r.nBtn).addClass("nBtn").html("<div></div>").attr("title", "Hide/Show Columns").click(function () {
				e(r.nDiv).toggle();
				return true
			});
			if (n.showToggleBtn) e(r.gDiv).prepend(r.nBtn)
		}
		e(r.iDiv).addClass("iDiv").css({
			display: "none"
		});
		e(r.bDiv).append(r.iDiv);
		e(r.bDiv).hover(function () {
			e(r.nDiv).hide();
			e(r.nBtn).hide()
		}, function () {
			if (r.multisel) r.multisel = false
		});
		e(r.gDiv).hover(function () {}, function () {
			e(r.nDiv).hide();
			e(r.nBtn).hide()
		});
		e(document).mousemove(function (e) {
			r.dragMove(e)
		}).mouseup(function (e) {
			r.dragEnd();
			if (n.onDragEnd) 
			{
				var i = n.onDragEnd();
				if (!i) return false
			}
		}).hover(function () {}, function () {
			r.dragEnd()
		});
		if (e.browser.msie && e.browser.version < 7) {
			e(".hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv", r.gDiv).css({
				width: "100%"
			});
			e(r.gDiv).addClass("ie6");
			if (n.width != "auto") e(r.gDiv).addClass("ie6fullwidthbug")
		}
		r.rePosDrag();
		r.fixHeight();
		t.p = n;
		t.grid = r;
		if (n.url && n.autoload) {
			r.populate()
		}
		return t
	};
	var t = false;
	e(document).ready(function () {
		t = true
	});
	e.fn.flexigrid = function (n) {
		return this.each(function () {
			if (!t) {
				e(this).hide();
				var r = this;
				e(document).ready(function () {
					e.addFlex(r, n)
				})
			} else {
				e.addFlex(this, n)
			}
		})
	};
	e.fn.getSelectedItem = function (e) {
		return(this[0].selectedItem);
	};
	e.fn.flexReload = function (e) {
		return this.each(function () {
			this.selectedItem=false;
			if (this.grid && this.p.url) this.grid.populate()
		})
	};
	e.fn.flexOptions = function (t) {
		return this.each(function () {
			if (this.grid) e.extend(this.p, t)
		})
	};
	e.fn.flexToggleCol = function (e, t) {
		return this.each(function () {
			if (this.grid) this.grid.toggleCol(e, t)
		})
	};
	e.fn.flexAddData = function (e) {
		return this.each(function () {
			if (this.grid) this.grid.addData(e)
		})
	};
	e.fn.noSelect = function (t) {
		if (t == null) prevent = true;
		else prevent = t; if (prevent) {

			return this.each(function () {
				if (e.browser.msie || e.browser.safari) e(this).bind("selectstart", function () {
					return false
				});
				else if (e.browser.mozilla) {
					e(this).css("MozUserSelect", "none");
					e("body").trigger("focus")
				} else if (e.browser.opera) e(this).bind("mousedown", function () {
					return false
				});
				else e(this).attr("unselectable", "on")
			})
		} else {
			return this.each(function () {
				if (e.browser.msie || e.browser.safari) e(this).unbind("selectstart");
				else if (e.browser.mozilla) e(this).css("MozUserSelect", "inherit");
				else if (e.browser.opera) e(this).unbind("mousedown");
				else e(this).removeAttr("unselectable", "on")
			})
		}
	}
})(jQuery)
