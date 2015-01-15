(function ($, w, undefined) {
    if (w.footable === undefined || w.footable === null)
        throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

    var defaults = {
        filter: {
            enabled: true,
            input: '.footable-filter',
            timeout: 300,
            minimum: 1,
            disableEnter: false,
            filterFunction: function(index) {
				//var aryOps = ['<','>','-','=','!'];
				var reg = /(^\<\=|^\>\=|^\<|^\>|^\-|^\=|^\!)/g;
				//var rExact = /(\-*(\"\"[^\"\"]+\"\"))*/;
				var rExact = /\-*(""[^""]+"")/;
                var $t = $(this),
                    $table = $t.parents('table:first'),
					filter = $table.data('current-filter').toUpperCase();
				
					//var ops = reg.match(filter)[0];
				var exact = rExact.test(filter);
				var ops = (filter.match(reg)?filter.match(reg)[0]:null);
				
				filter = filter.replace(reg,'').replace(/"/g,'');
				if ($table.data('current-column')){
					var dex = $table.find('thead tr:eq(0) th span[data-title="'+$table.data('current-column').toUpperCase()+'"]').closest('th').index();
					var text = $t.find('td:eq('+dex+')').text();
				}else{
					var text = $t.find('td').text();
				}				
                if (!$table.data('filter-text-only')) {					
					$t.find('td[data-value]').each(function () {
						text += $(this).data('value');
					});
                }
				
				switch(ops){
					case '<=':
						return (text.indexOf('-')>-1?parseFloat(text.replace(/-/g,'').substring(0,filter.replace(/-/g,'').length)) <= parseFloat(filter.replace(/-/g,'')):parseFloat(text) <= parseFloat(filter));
						break;
					case '>=':
						return (text.indexOf('-')>-1?parseFloat(text.replace(/-/g,'').substring(0,filter.replace(/-/g,'').length)) >= parseFloat(filter.replace(/-/g,'')):parseFloat(text) >= parseFloat(filter));
						break;
					case '<':
						return (text.indexOf('-')>-1?parseFloat(text.replace(/-/g,'').substring(0,filter.replace(/-/g,'').length)) < parseFloat(filter.replace(/-/g,'')):parseFloat(text) < parseFloat(filter));
						break;
					case '>':
						return (text.indexOf('-')>-1?parseFloat(text.replace(/-/g,'').substring(0,filter.replace(/-/g,'').length)) > parseFloat(filter.replace(/-/g,'')):parseFloat(text) > parseFloat(filter));
						break;
					case '=':
						return parseFloat(text) == parseFloat(filter);break;
					case '!':
						return parseFloat(text) != parseFloat(filter);break;
					case '-':
						return (filter=='[BLANK]'?$.trim(text).length>0:(exact?text.toUpperCase() != filter:text.toUpperCase().indexOf(filter) == -1));
						break;
					default:
						return (filter=='[BLANK]'?$.trim(text).length==0:(exact?text.toUpperCase() == filter:text.toUpperCase().indexOf(filter) >= 0));
						break;
				}
            }
        }
    };

    function Filter() {
        var p = this;
        p.name = 'Footable Filter';
        p.init = function (ft) {
            p.footable = ft;
            if (ft.options.filter.enabled === true) {
                if ($(ft.table).data('filter') === false) return;
                ft.timers.register('filter');
                $(ft.table)
                    .unbind('.filtering')
                    .bind({
                        'footable_initialized.filtering': function (e) {
                            var $table = $(ft.table);
                            var data = {
                                'input': $table.data('filter') || ft.options.filter.input,
                                'timeout': $table.data('filter-timeout') || ft.options.filter.timeout,
                                'minimum': $table.data('filter-minimum') || ft.options.filter.minimum,
                                'disableEnter': $table.data('filter-disable-enter') || ft.options.filter.disableEnter
                            };
                            if (data.disableEnter) {
                                $(data.input).keypress(function (event) {
                                    if (window.event)
                                        return (window.event.keyCode !== 13);
                                    else
                                        return (event.which !== 13);
                                });
                            }
                            $table.bind('footable_clear_filter', function () {
                                $(data.input).val('');
                                p.clearFilter();
                            });
                            $table.bind('footable_filter', function (event, args) {
                                p.filter(args.filter);
                            });
                            $(data.input).keyup(function (eve) {
                                ft.timers.filter.stop();
                                if (eve.which === 27) {
                                    $(data.input).val('');
                                }
                                ft.timers.filter.start(function () {
                                    var val = $(data.input).val() || '';
                                    p.filter(val);
                                }, data.timeout);
                            });
                        },
                        'footable_redrawn.filtering': function (e) {
                            var $table = $(ft.table),
                                filter = $table.data('filter-string');
                            if (filter) {
                                p.filter(filter);
                            }
                        }
                })
                //save the filter object onto the table so we can access it later
                .data('footable-filter', p);
            }
        };

        p.filter = function (filterString) {
            var ft = p.footable,
                $table = $(ft.table),
                minimum = $table.data('filter-minimum') || ft.options.filter.minimum,
                clear = !filterString;

            //raise a pre-filter event so that we can cancel the filtering if needed
            var event = ft.raise('footable_filtering', { filter: filterString, clear: clear });
            if (event && event.result === false) return;
            if (event.filter && event.filter.length < minimum) {
              return; //if we do not have the minimum chars then do nothing
            }

			if (event.clear) {
                p.clearFilter();
            } else {
			
				var _or = event.filter.split(/or(?=([^"]*"[^"]*")*[^"]*$)/ig);
				
				$.each(_or,function(dex,val){
					if (val==undefined) return true;
					var filters = val.split(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g);
					var reg     = /\w+:(\-*(\w+|"[^"]+"))*/; 
					if (dex==0){
						$table.find('> tbody > tr').hide().addClass('footable-filtered');
						var rows = $table.find('> tbody > tr:not(.footable-row-detail)');
					}else{
						var rows = $table.find('> tbody > tr.footable-filtered');
					}
					$.each(filters, function (i, f) {
						if (f && f.length > 0) {
							//looks for exact match (doesn't filter first so user can still find 
							if (f.substring(0,1)=='"' && f.slice(-1)!='"') return false;
							f = $.trim(f);
							//Searches in specific column
							if (reg.test(f)){
								var c = f.split(':');
								$table.data('current-column',c[0]);
								//$table.data('current-filter',$.trim(c[1].split('"').length-1==2?c[1].replace(/"/g,''):c[1]));
								$table.data('current-filter',$.trim(c[1]));

								rows = rows.filter(ft.options.filter.filterFunction);
								$table.removeData('current-column');
							}else{
								$table.data('current-filter', f);
								rows = rows.filter(ft.options.filter.filterFunction);
							}
						}
					});
					
					
					rows.each(function () {
						p.showRow(this, ft);
					});
					
					$table.data('filter-string', event.filter);
					ft.raise('footable_filtered', { filter: event.filter, clear: false });
					
					var num = $table.find('tbody tr:not(.footable-row-detail)').filter(function() {return $(this).css('display') !== 'none';}).length;
					//mrh
					$('#filtered-number').html(num + ' of ' + $table.find('tbody tr:not(.footable-row-detail)').length);
					$('#togrow-num').html(($('.highlight').length>0?($('.highlight:visible').length+' of '+$('#tblData tbody tr:not(.footable-row-detail)').length):''));
				});
            }
			
		};
		
		p.showRow = function (row, ft) {
            var $row = $(row), $next = $row.next(), $table = $(ft.table);
            if ($row.is(':visible')) return; //already visible - do nothing
			/*
            if ($table.hasClass('breakpoint') && $row.hasClass('footable-detail-show') && $next.hasClass('footable-row-detail')) {
                $row.add($next).show();
                ft.createOrUpdateDetailRow(row);
            }
			*/
            //else $row.show();
			$row.removeClass('footable-filtered').show();
        };

        p.clearFilter = function () {
            var ft = p.footable,$table = $(ft.table);
			var total = $('tbody tr:not(.footable-row-detail)',ft.table).length;
			
			$table.find('> tbody > tr:not(.footable-row-detail)').removeClass('footable-filtered').each(function () {
                p.showRow(this, ft);
            });
            $table.removeData('filter-string current-column');
            ft.raise('footable_filtered', { clear: true });
			//mrh
            $('#filtered-number').html(total + ' of ' + total);
			$('#togrow-num').html(($('.highlight').length>0?($('.highlight:visible').length+' of '+$('#tblData tbody tr:not(.footable-row-detail)').length):''));
			
        };

        
    }

    w.footable.plugins.register(Filter, defaults);

})(jQuery, window);
