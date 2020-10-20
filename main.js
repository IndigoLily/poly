const c = document.body.appendChild(document.createElement('canvas')).getContext('2d');

var w, h;

class Point {
    constructor(x, y) {
	this.x = x;
	this.y = y;
	this.segs = []; // (the indices of) all segments that this point is part of
    }

    draw() {
	c.beginPath();
	c.arc(this.x, this.y, c.lineWidth, 0, Math.PI*2);
	c.fill();
    }
}

class Line {
    constructor(m, b) {
	this.m = m;
	this.b = b;
    }

    isVert() {
	return this.x !== undefined;
    }

    static fromAnglePoint(a, p) {
	if (a == Math.PI/2) {
	    const line = new Line();
	    line.x = p1.x;
	    return line;
	} else {
	    const line = new Line(Math.tan(a), 0);
	    line.b += p.y - line.at(p.x);
	    return line;
	}
    }

    static fromPoints(p1, p2) {
	if (p1.x == p2.x) {
	    const line = new Line();
	    line.x = p1.x;
	    return line;
	} else {
	    const m = (p2.y-p1.y)/(p2.x-p1.x);
	    const line = new Line(m, 0);
	    line.b += p1.y - line.at(p1.x);
	    return line;
	}
    }

    at(x) {
	return this.m * x + this.b;
    }

    intxn(other) {
	//debugger;
	if (this.isVert() && other.isVert()) { // both vertical
	    return undefined;
	} else if (this.isVert()) {
	    return new Point(this.x, other.at(this.x));
	} else if (other.isVert()) {
	    return new Point(other.x, this.at(other.x));
	} else if (this.m === other.m) {
	    return undefined;
	} else {
	    const x = (other.b-this.b)/(this.m-other.m);
	    return new Point(x, this.at(x));
	}
    }

    draw() {
	c.beginPath();
	if (this.x === undefined) {
	    c.moveTo(0, this.at(0));
	    c.lineTo(w, this.at(w));
	} else  {
	    c.moveTo(this.x, 0);
	    c.lineTo(this.x, h);
	}
	c.stroke();
    }
}

class Seg {
    constructor(p1, p2, outside = false) {
	this.p1 = p1;
	this.p2 = p2;
	this.outside = outside;
    }

    getp1() {
	return points[this.p1];
    }

    getp2() {
	return points[this.p2];
    }

    contains(p) {
	if (this.line().isVert()) {
	    return this.getp1().y < p.y && p.y < this.getp2().y ||
		   this.getp2().y < p.y && p.y < this.getp1().y;
	} else {
	    return this.getp1().x < p.x && p.x < this.getp2().x ||
		   this.getp2().x < p.x && p.x < this.getp1().x;
	}
    }

    line() {
	return Line.fromPoints(this.getp1(), this.getp2());
    }

    lineIntxn(other) {
	const line = this.line();
	const intxn = line.intxn(other);
	if (intxn === undefined) {
	    return undefined;
	} else if (!this.contains(intxn)) {
	    return undefined;
	} else {
	    return intxn;
	}
    }

    segIntxn(other) {
	const line1 = this.line();
	const line2 = other.line();
	const intxn = line1.intxn(line2);
	if (intxn === undefined) {
	    return undefined;
	} else if (!(this.contains(intxn) && other.contains(intxn))) {
	    return undefined;
	} else {
	    return intxn;
	}
    }

    static angle(seg1, seg2) {
	const _c = [seg1.p1, seg1.p2].find(el => [seg2.p1, seg2.p2].includes(el));
	const _a = [seg1.p1, seg1.p2].find(p => p != _c);
	const _b = [seg2.p1, seg2.p2].find(p => p != _c);

	const [pa, pb, pc] = [_a, _b, _c].map(p => points[p]);

	const A = new Point(pa.x - pc.x, pa.y - pc.y);
	const B = new Point(pb.x - pc.x, pb.y - pc.y);

	return ((Math.PI * 2 + Math.atan2(B.y, B.x)) % (Math.PI*2) + Math.PI*2 - Math.atan2(A.y, A.x)) % (Math.PI*2);
    }

    draw() {
	c.save();
	//c.strokeStyle = '#fff';
	c.beginPath();
	c.moveTo(points[this.p1].x, points[this.p1].y);
	c.lineTo(points[this.p2].x, points[this.p2].y);
	c.stroke();
	c.restore();
    }
}

var points;
var segs;
function reset() {
    w = c.canvas.width  = innerWidth;
    h = c.canvas.height = innerHeight;

    points = [
	new Point(-10, -10),
	new Point(w+10, -10),
	new Point(w+10, h+10),
	new Point(-10, h+10),
    ];
    segs = [
	new Seg(0, 1, true),
	new Seg(1, 2, true),
	new Seg(2, 3, true),
	new Seg(3, 0, true),
    ];
    points[0].segs = [0, 3];
    points[1].segs = [0, 1];
    points[2].segs = [1, 2];
    points[3].segs = [2, 3];

    while (Math.random() < 1000/points.length) {
	add(
	    new Point(
		20 + Math.random()*(w-40),
		20 + Math.random()*(h-40)
	    )
	);
    }
}
reset();

function drawLines(clear = true) {
    if (clear) {
	c.clearRect(0, 0, w, h);
    }
    c.lineWidth = 2;

    for (let i = 0; i < segs.length; i++) {
	c.strokeStyle = '#000';
	segs[i].draw();
    }

    /*
    for (const p of points) {
	c.fillStyle = '#02f';
	c.beginPath();
	c.arc(p.x, p.y, c.lineWidth, 0, Math.PI*2);
	c.fill();
    }
    */
}

function add(point) {
    //const point = new Point(
    //    w * Math.random(),
    //    h * Math.random()
    //);
    const line = Line.fromAnglePoint(
	Math.random()*Math.PI*2,
	point
    );

    //line.draw();

    const intxns = [];
    for (let i = 0; i < segs.length; i++) {
	const intxn = segs[i].lineIntxn(line);
	if (intxn !== undefined) {
	    intxn.segs = [i]; // save index of segment it intersects with
	    intxns.push(intxn);
	}
    }
    if (line.isVert()) {
    } else {
	// find the closest intersection in each direction
	const right = intxns.filter(el => el.x > point.x).sort((a,b)=>a.x-b.x)[0];
	const left  = intxns.filter(el => el.x < point.x).sort((a,b)=>b.x-a.x)[0];

	points.push(right, left);

	// indices of right and left points in the points array
	const idxRight = points.length-2;
	const idxLeft  = points.length-1;

	right.segs.push(segs.length);
	left.segs.push(segs.length);
	segs.push(new Seg(idxRight, idxLeft));

	// replace each intersected segment with seg(p1, intxn), seg(intx, p2)
	{
	    const i = right.segs[0]; // index of intersected segment
	    right.segs.push(segs.length);
	    segs.push(new Seg(idxRight, segs[i].p2, segs[i].outside));

	    {
	    const p = segs[i].getp2(); // point in intersected segment
	    p.segs.splice(p.segs.indexOf(i), 1, segs.length-1); // in intersected segment's point, replace old segment's index with new segment's index
	    }

	    segs[i].p2 = idxRight;
	}

	{
	    const i = left.segs[0]; // index of old segment
	    left.segs.push(segs.length);
	    segs.push(new Seg(idxLeft, segs[i].p2, segs[i].outside));

	    {
	    const p = segs[i].getp2(); // point in old segment
	    p.segs.splice(p.segs.indexOf(i), 1, segs.length-1); // in old segment's point, replace old segment's index with new segment's index
	    }

	    segs[i].p2 = idxLeft;
	}
    }
}

function getPolys() {
    const polys = [];
    const polycount = {}; // associative array of segment index to polycount

    // for every segment
    for (let i = 0; i < segs.length; i++) {
	// except outside ones
	if (segs[i].outside) continue;

	// find the polygons made by winding clockwise, starting from both points in the segment
	find:
	for (const pn of ['p1', 'p2']) {
	    const poly = []; // indices of points in polygon, in winding order
	    const polysegs = []; // indices of segments in polygon
	    let segIdx = i;
	    let seg = segs[segIdx];
	    let lastp = seg[pn];
	    let cdts;
	    let p;
	    do {
		if (polycount[segIdx] == 2) {
		    continue find;
		}
		polysegs.push(segIdx);

		seg = segs[segIdx];
		p = [seg.p1, seg.p2].find(el => el !== lastp);
		poly.push(p);
		lastp = p;

		cdts = points[p].segs.filter(s => s !== segIdx); // find all segments connected to the point

		// set segIdx to clockwise-most candidate
		segIdx = cdts.reduce((acc, cur) => {
		    const a1 = Seg.angle(seg, segs[cur]);
		    const a2 = Seg.angle(seg, segs[acc]);
		    if (a1 > a2) {
			return cur;
		    } else {
			return acc;
		    }
		});
	    } while (segIdx !== i);

	    polysegs.forEach(ps => polycount[ps] = polycount[ps]+1 || 1);
	    polys.push(poly);
	}
    }

    return polys;
}

function drawPolys() {
    getPolys().forEach(poly => {
	c.fillStyle = `hsl(0, 0%, ${Math.sin(Date.now()/1000 + points[poly[0]].x + points[poly[0]].y / w / h * Math.PI*2)*50+50}%)`;
	c.beginPath();
	poly.forEach(p => {
	    c.lineTo(points[p].x, points[p].y);
	});
	c.fill();
    });

    drawLines(false);
}

window.addEventListener('mousedown', e => {
    reset();
});

window.addEventListener('resize', e => {
    reset();
});

function frame() {
    drawPolys();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
