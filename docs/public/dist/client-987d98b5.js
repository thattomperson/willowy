function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe,
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

const ChunkGenerator = (Component) => {
  return (dynamicImport) => Chunk(dynamicImport, Component)
};

const Chunk = (dynamicImport, Component) => {
  return class SvelteComponentHook {
    constructor (options) {
      options.props = {
        ...options.props,
        dynamicImport
      };
      return new Component(options)
    }
  }
};

/* generated by Svelte v3.20.1 */
const get_default_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_default_slot_context = ctx => ({ component: /*component*/ ctx[0] });
const get_success_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_success_slot_context = ctx => ({ component: /*component*/ ctx[0] });
const get_loading_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_loading_slot_context = ctx => ({ component: /*component*/ ctx[0] });
const get_timeout_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_timeout_slot_context = ctx => ({ component: /*component*/ ctx[0] });

const get_error_slot_changes = dirty => ({
	error: dirty & /*error*/ 2,
	component: dirty & /*component*/ 1
});

const get_error_slot_context = ctx => ({
	error: /*error*/ ctx[1],
	component: /*component*/ ctx[0]
});

// (123:35) 
function create_if_block_3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_4, create_if_block_5, create_else_block];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*slots*/ ctx[4] && /*slots*/ ctx[4].success) return 0;
		if (/*slots*/ ctx[4] && /*slots*/ ctx[4].default) return 1;
		return 2;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if_block.p(ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (121:35) 
function create_if_block_2(ctx) {
	let current;
	const loading_slot_template = /*$$slots*/ ctx[15].loading;
	const loading_slot = create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[14], get_loading_slot_context);

	return {
		c() {
			if (loading_slot) loading_slot.c();
		},
		m(target, anchor) {
			if (loading_slot) {
				loading_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (loading_slot) {
				if (loading_slot.p && dirty & /*$$scope, component*/ 16385) {
					loading_slot.p(get_slot_context(loading_slot_template, ctx, /*$$scope*/ ctx[14], get_loading_slot_context), get_slot_changes(loading_slot_template, /*$$scope*/ ctx[14], dirty, get_loading_slot_changes));
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(loading_slot, local);
			current = true;
		},
		o(local) {
			transition_out(loading_slot, local);
			current = false;
		},
		d(detaching) {
			if (loading_slot) loading_slot.d(detaching);
		}
	};
}

// (119:35) 
function create_if_block_1(ctx) {
	let current;
	const timeout_slot_template = /*$$slots*/ ctx[15].timeout;
	const timeout_slot = create_slot(timeout_slot_template, ctx, /*$$scope*/ ctx[14], get_timeout_slot_context);

	return {
		c() {
			if (timeout_slot) timeout_slot.c();
		},
		m(target, anchor) {
			if (timeout_slot) {
				timeout_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (timeout_slot) {
				if (timeout_slot.p && dirty & /*$$scope, component*/ 16385) {
					timeout_slot.p(get_slot_context(timeout_slot_template, ctx, /*$$scope*/ ctx[14], get_timeout_slot_context), get_slot_changes(timeout_slot_template, /*$$scope*/ ctx[14], dirty, get_timeout_slot_changes));
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(timeout_slot, local);
			current = true;
		},
		o(local) {
			transition_out(timeout_slot, local);
			current = false;
		},
		d(detaching) {
			if (timeout_slot) timeout_slot.d(detaching);
		}
	};
}

// (117:0) {#if state === STATES.ERROR}
function create_if_block(ctx) {
	let current;
	const error_slot_template = /*$$slots*/ ctx[15].error;
	const error_slot = create_slot(error_slot_template, ctx, /*$$scope*/ ctx[14], get_error_slot_context);

	return {
		c() {
			if (error_slot) error_slot.c();
		},
		m(target, anchor) {
			if (error_slot) {
				error_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (error_slot) {
				if (error_slot.p && dirty & /*$$scope, error, component*/ 16387) {
					error_slot.p(get_slot_context(error_slot_template, ctx, /*$$scope*/ ctx[14], get_error_slot_context), get_slot_changes(error_slot_template, /*$$scope*/ ctx[14], dirty, get_error_slot_changes));
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(error_slot, local);
			current = true;
		},
		o(local) {
			transition_out(error_slot, local);
			current = false;
		},
		d(detaching) {
			if (error_slot) error_slot.d(detaching);
		}
	};
}

// (128:2) {:else}
function create_else_block(ctx) {
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*componentProps*/ ctx[3]];
	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*componentProps*/ 8)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*componentProps*/ ctx[3])])
			: {};

			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (126:35) 
function create_if_block_5(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[15].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, component*/ 16385) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes));
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (124:2) {#if slots && slots.success}
function create_if_block_4(ctx) {
	let current;
	const success_slot_template = /*$$slots*/ ctx[15].success;
	const success_slot = create_slot(success_slot_template, ctx, /*$$scope*/ ctx[14], get_success_slot_context);

	return {
		c() {
			if (success_slot) success_slot.c();
		},
		m(target, anchor) {
			if (success_slot) {
				success_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (success_slot) {
				if (success_slot.p && dirty & /*$$scope, component*/ 16385) {
					success_slot.p(get_slot_context(success_slot_template, ctx, /*$$scope*/ ctx[14], get_success_slot_context), get_slot_changes(success_slot_template, /*$$scope*/ ctx[14], dirty, get_success_slot_changes));
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(success_slot, local);
			current = true;
		},
		o(local) {
			transition_out(success_slot, local);
			current = false;
		},
		d(detaching) {
			if (success_slot) success_slot.d(detaching);
		}
	};
}

function create_fragment(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*state*/ ctx[2] === STATES.ERROR) return 0;
		if (/*state*/ ctx[2] === STATES.TIMEOUT) return 1;
		if (/*state*/ ctx[2] === STATES.LOADING) return 2;
		if (/*state*/ ctx[2] === STATES.SUCCESS) return 3;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach(if_block_anchor);
		}
	};
}
const LOADED = new Map();

const STATES = Object.freeze({
	INITIALIZED: 0,
	LOADING: 1,
	SUCCESS: 2,
	ERROR: 3,
	TIMEOUT: 4
});

async function load(loader) {
	const componentModule = await loader();
	const component = componentModule.default || componentModule;
	LOADED.set(loader, component);
	return component;
}

let loadComponent = load;

function instance($$self, $$props, $$invalidate) {
	let { delay = 200 } = $$props;
	let { timeout = null } = $$props;
	let { loader = null } = $$props;
	let { unloader = false } = $$props;
	let { component = null } = $$props;
	let { error = null } = $$props;
	let load_timer = null;
	let timeout_timer = null;
	let state = STATES.INITIALIZED;
	let componentProps;
	let slots = $$props.$$slots;

	function clearTimers() {
		clearTimeout(load_timer);
		clearTimeout(timeout_timer);
	}

	async function load() {
		clearTimers();

		if (typeof loader !== "function") {
			return;
		}

		$$invalidate(1, error = null);
		$$invalidate(0, component = null);

		if (delay > 0) {
			$$invalidate(2, state = STATES.INITIALIZED);

			load_timer = setTimeout(
				() => {
					$$invalidate(2, state = STATES.LOADING);
				},
				parseFloat(delay)
			);
		} else {
			$$invalidate(2, state = STATES.LOADING);
		}

		if (timeout) {
			timeout_timer = setTimeout(
				() => {
					$$invalidate(2, state = STATES.TIMEOUT);
				},
				parseFloat(timeout)
			);
		}

		try {
			$$invalidate(0, component = await loadComponent(loader));
			$$invalidate(2, state = STATES.SUCCESS);
		} catch(e) {
			$$invalidate(2, state = STATES.ERROR);
			$$invalidate(1, error = e);

			if (slots == null || slots.error == null) {
				throw e;
			}
		}

		clearTimers();
	}

	if (LOADED.has(loader)) {
		state = STATES.SUCCESS;
		component = LOADED.get(loader);
	} else {
		onMount(() => {
			load();

			if (unloader) {
				return () => {
					LOADED.delete(loader);

					if (typeof unloader === "function") {
						unloader();
					}
				};
			}
		});
	}

	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$new_props => {
		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("delay" in $$new_props) $$invalidate(5, delay = $$new_props.delay);
		if ("timeout" in $$new_props) $$invalidate(6, timeout = $$new_props.timeout);
		if ("loader" in $$new_props) $$invalidate(7, loader = $$new_props.loader);
		if ("unloader" in $$new_props) $$invalidate(8, unloader = $$new_props.unloader);
		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
		if ("error" in $$new_props) $$invalidate(1, error = $$new_props.error);
		if ("$$scope" in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		 {
			let { delay, timeout, loader, component, error, ...rest } = $$props;
			$$invalidate(3, componentProps = rest);
		}
	};

	$$props = exclude_internal_props($$props);

	return [
		component,
		error,
		state,
		componentProps,
		slots,
		delay,
		timeout,
		loader,
		unloader,
		load,
		load_timer,
		timeout_timer,
		clearTimers,
		$$props,
		$$scope,
		$$slots
	];
}

class Component extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			delay: 5,
			timeout: 6,
			loader: 7,
			unloader: 8,
			component: 0,
			error: 1,
			load: 9
		});
	}

	get load() {
		return this.$$.ctx[9];
	}
}

/* generated by Svelte v3.20.1 */

function create_loading_slot(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "slot", "loading");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (12:4) <div class="loadable-container" slot="success" let:component>
function create_success_slot(ctx) {
	let div;
	let current;
	var switch_value = /*component*/ ctx[3];

	function switch_props(ctx) {
		return { props: { params: /*params*/ ctx[0] } };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr(div, "class", "loadable-container");
			attr(div, "slot", "success");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty & /*params*/ 1) switch_instance_changes.params = /*params*/ ctx[0];

			if (switch_value !== (switch_value = /*component*/ ctx[3])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (switch_instance) destroy_component(switch_instance);
		}
	};
}

// (10:0) <Loadable loader={dynamicImport} {params} {delay}>
function create_default_slot(ctx) {
	let t;

	return {
		c() {
			t = space();
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

function create_fragment$1(ctx) {
	let current;

	const loadable = new Component({
			props: {
				loader: /*dynamicImport*/ ctx[1],
				params: /*params*/ ctx[0],
				delay: /*delay*/ ctx[2],
				$$slots: {
					default: [create_default_slot],
					success: [
						create_success_slot,
						({ component }) => ({ 3: component }),
						({ component }) => component ? 8 : 0
					],
					loading: [create_loading_slot]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(loadable.$$.fragment);
		},
		m(target, anchor) {
			mount_component(loadable, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const loadable_changes = {};
			if (dirty & /*dynamicImport*/ 2) loadable_changes.loader = /*dynamicImport*/ ctx[1];
			if (dirty & /*params*/ 1) loadable_changes.params = /*params*/ ctx[0];
			if (dirty & /*delay*/ 4) loadable_changes.delay = /*delay*/ ctx[2];

			if (dirty & /*$$scope, params, component*/ 25) {
				loadable_changes.$$scope = { dirty, ctx };
			}

			loadable.$set(loadable_changes);
		},
		i(local) {
			if (current) return;
			transition_in(loadable.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(loadable.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(loadable, detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { params = {} } = $$props;
	let { dynamicImport } = $$props;
	let { delay = 0 } = $$props;

	$$self.$set = $$props => {
		if ("params" in $$props) $$invalidate(0, params = $$props.params);
		if ("dynamicImport" in $$props) $$invalidate(1, dynamicImport = $$props.dynamicImport);
		if ("delay" in $$props) $$invalidate(2, delay = $$props.delay);
	};

	return [params, dynamicImport, delay];
}

class Component$1 extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { params: 0, dynamicImport: 1, delay: 2 });
	}
}

const Chunk$1 = ChunkGenerator(Component$1);

        var routes = {
          '/': Chunk$1(() => import('./index-458f3835.js')),
'/about': Chunk$1(() => import('./about-e0169558.js')),
'*': Chunk$1(() => import('./index-458f3835.js'))
        };

function regexparam (str, loose) {
  if (str instanceof RegExp) return { keys: false, pattern: str }
  var c;
  var o;
  var tmp;
  var ext;
  var keys = [];
  var pattern = '';
  var arr = str.split('/');
  arr[0] || arr.shift();

  while ((tmp = arr.shift())) {
    c = tmp[0];
    if (c === '*') {
      keys.push('wild');
      pattern += '/(.*)';
    } else if (c === ':') {
      o = tmp.indexOf('?', 1);
      ext = tmp.indexOf('.', 1);
      keys.push(tmp.substring(1, ~o ? o : ~ext ? ext : tmp.length));
      pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
      if (~ext) pattern += (~o ? '?' : '') + '\\' + tmp.substring(ext);
    } else {
      pattern += '/' + tmp;
    }
  }

  return {
    keys: keys,
    pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i')
  }
}

/* generated by Svelte v3.20.1 */

function create_else_block$1(ctx) {
	let switch_instance_anchor;
	let current;
	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		return {};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[6]);
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[6]);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (289:0) {#if componentParams}
function create_if_block$1(ctx) {
	let switch_instance_anchor;
	let current;
	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		return {
			props: { params: /*componentParams*/ ctx[1] }
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[5]);
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty & /*componentParams*/ 2) switch_instance_changes.params = /*componentParams*/ ctx[1];

			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[5]);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$1, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*componentParams*/ ctx[1]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function getLocation() {
	return {
		location: window.location.pathname,
		querystring: window.location.search.substr(1)
	};
}

const loc = writable(getLocation(), // eslint-disable-next-line prefer-arrow-callback
function start(set) {
	const update = () => {
		set(getLocation());
	};

	window.addEventListener("popstate", update, false);

	return function stop() {
		window.removeEventListener("popstate", update, false);
	};
});

const location = derived(loc, $loc => $loc.location);
const querystring = derived(loc, $loc => $loc.querystring);

function push(location) {
	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
		throw Error("Invalid parameter location");
	}

	// Execute this code when the current call stack is complete
	return nextTickPromise(() => {
		window.history.pushState(undefined, undefined, location);
		loc.set(getLocation());
	});
}

function nextTickPromise(cb) {
	return new Promise(resolve => {
			setTimeout(
				() => {
					resolve(cb());
				},
				0
			);
		});
}

function instance$2($$self, $$props, $$invalidate) {
	let $loc;
	component_subscribe($$self, loc, $$value => $$invalidate(2, $loc = $$value));

	class RouteItem {
		/**
 * Initializes the object and creates a regular expression from the path, using regexparam.
 *
 * @param {string} path - Path to the route (must start with '/' or '*')
 * @param {SvelteComponent} component - Svelte component for the route
 */
		constructor(path, component) {
			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
				throw Error("Invalid component object");
			}

			// Path must be a regular or expression, or a string starting with '/' or '*'
			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
				throw Error("Invalid value for \"path\" argument");
			}

			const { pattern, keys } = regexparam(path);
			this.path = path;

			// Check if the component is wrapped and we have conditions
			if (typeof component == "object" && component._sveltesparouter === true) {
				this.component = component.route;
				this.conditions = component.conditions || [];
				this.userData = component.userData;
			} else {
				this.component = component;
				this.conditions = [];
				this.userData = undefined;
			}

			this._pattern = pattern;
			this._keys = keys;
		}

		/**
 * Checks if `path` matches the current route.
 * If there's a match, will return the list of parameters from the URL (if any).
 * In case of no match, the method will return `null`.
 *
 * @param {string} path - Path to test
 * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
 */
		match(path) {
			// Check if the pattern matches
			const matches = this._pattern.exec(path);

			if (matches === null) {
				return null;
			}

			// If the input was a regular expression, this._keys would be false, so return matches as is
			if (this._keys === false) {
				return matches;
			}

			const out = {};
			let i = 0;

			while (i < this._keys.length) {
				out[this._keys[i]] = matches[++i] || null;
			}

			return out;
		}
	}

	// Set up all routes
	const routesList = [];

	if (routes instanceof Map) {
		// If it's a map, iterate on it right away
		routes.forEach((route, path) => {
			routesList.push(new RouteItem(path, route));
		});
	} else {
		// We have an object, so iterate on its own properties
		Object.keys(routes).forEach(path => {
			routesList.push(new RouteItem(path, routes[path]));
		});
	}

	// Props for the component to render
	let component = null;

	let componentParams = null;

	onMount(() => {
		const handleClick = event => {
			if (event.target.tagName == "A") {
				event.preventDefault();
				console.log(event.target);
				push(event.target.pathname);
			}
		};

		window.addEventListener("click", handleClick, false);

		return () => {
			window.removeEventListener("click", handleClick, false);
		};
	});

	function routeEvent_handler(event) {
		bubble($$self, event);
	}

	function routeEvent_handler_1(event) {
		bubble($$self, event);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*component, $loc*/ 5) {
			// Handle hash change events
			// Listen to changes in the $loc store and update the page
			 {
				// Find a route matching the location
				$$invalidate(0, component = null);

				let i = 0;

				while (!component && i < routesList.length) {
					const match = routesList[i].match($loc.location);

					if (match) {
						const detail = {
							component: routesList[i].component,
							name: routesList[i].component.name,
							location: $loc.location,
							querystring: $loc.querystring,
							userData: routesList[i].userData
						};

						$$invalidate(0, component = routesList[i].component);

						// Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
						// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
						if (match && typeof match == "object" && Object.keys(match).length) {
							$$invalidate(1, componentParams = match);
						} else {
							$$invalidate(1, componentParams = null);
						}
					}

					i++;
				}
			}
		}
	};

	return [
		component,
		componentParams,
		$loc,
		RouteItem,
		routesList,
		routeEvent_handler,
		routeEvent_handler_1
	];
}

class Component$2 extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
	}
}

const router = new Component$2({
  target: document.getElementById('app')
});

export { SvelteComponent as S, space as a, attr as b, insert as c, detach as d, element as e, init as i, noop as n, router as r, safe_not_equal as s };
//# sourceMappingURL=client-987d98b5.js.map
