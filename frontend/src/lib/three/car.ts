import * as THREE from 'three';

export function createCarPlaceholder(color: THREE.ColorRepresentation) {
	const group = new THREE.Group();
	const paint = new THREE.MeshStandardMaterial({
		color,
		metalness: 0.9,
		roughness: 0.28
	});
	const glass = new THREE.MeshStandardMaterial({
		color: 0x88a0b8,
		metalness: 0.9,
		roughness: 0.1,
		transparent: true,
		opacity: 0.55
	});
	const rubber = new THREE.MeshStandardMaterial({
		color: 0x1a1a1a,
		metalness: 0.15,
		roughness: 0.85
	});

	const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 1.15), paint);
	body.position.y = 0.48;
	body.castShadow = true;

	const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.38, 1.05), paint);
	cabin.position.set(-0.2, 0.85, 0);
	cabin.castShadow = true;

	const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.95), glass);
	windshield.position.set(0.38, 0.84, 0);

	const hood = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 1.05), paint);
	hood.position.set(0.75, 0.68, 0);

	group.add(body, cabin, windshield, hood);

	const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24);
	const spots: [number, number, number][] = [
		[0.75, 0.22, 0.52],
		[0.75, 0.22, -0.52],
		[-0.75, 0.22, 0.52],
		[-0.75, 0.22, -0.52]
	];
	for (const [x, y, z] of spots) {
		const wheel = new THREE.Mesh(wheelGeo, rubber);
		wheel.rotation.z = Math.PI / 2;
		wheel.position.set(x, y, z);
		wheel.castShadow = true;
		group.add(wheel);
	}

	group.userData.paint = paint;
	return group;
}
