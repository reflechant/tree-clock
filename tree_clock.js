function line_from_polar(global_start, start, end, color) {
    const result = [];
    const start_x = global_start.x + start.distance * Math.cos(start.angle - Math.PI/2);
    const start_y = global_start.y + start.distance * Math.sin(start.angle - Math.PI/2);
    const end_x = global_start.x + end.distance * Math.cos(end.angle - Math.PI/2);
    const end_y = global_start.y + end.distance * Math.sin(end.angle - Math.PI/2);

    result.push([{ x: start_x, y: start_y }, { x: end_x, y: end_y }, color]);
    return result;
}

// global_start is cartesian {x: number, y: number}
// sector_start and sector_end are sector boundaries in respect to the global_start
function branch(global_start, sector_start, sector_end, distance_start, height, branch_number, color) {
    const result = [];
    for (let i = 0; i < branch_number; i++) {
        const sector_start_angle = sector_start + i * (sector_end - sector_start) / branch_number;
        const sector_end_angle = sector_start + (i + 1) * (sector_end - sector_start) / branch_number;
        const line_end_angle = sector_start_angle;  // Each branch points at its sector start
        const start = { angle: sector_start_angle, distance: distance_start };
        const end = { angle: line_end_angle, distance: distance_start + height };
        result.push(...line_from_polar(global_start, start, end, color));
    }
    return result;
}

// returns sectors start and end angles as pairs given the number of sectors
function sectors(start_angle, end_angle, number_of_sectors) {
    const result = [];
    const sector_step = (end_angle - start_angle) / number_of_sectors;
    for (let i = 0; i < number_of_sectors; i++) {
        const sector_start_angle = start_angle + i * sector_step;
        const sector_end_angle = start_angle + (i + 1) * sector_step;
        result.push([sector_start_angle, sector_end_angle]);
    }
    return result;
}

function tree_clock(global_start, start_angle, end_angle, height, hour_factor, minute_factor, second_factor, colors) {
    const result = [];
    let hours = 24;
    let current_branches = 1;  // Start with 1 branch
    let distance_start = 0;
    let layer = 0;
    
    for (const hf of hour_factor) {
        while (hours % hf === 0) {
            hours = Math.floor(hours / hf);
            const hour_sectors = sectors(start_angle, end_angle, current_branches);
            for (const [sector_start, sector_end] of hour_sectors) {
                result.push(...branch(global_start, sector_start, sector_end, distance_start, height, hf, colors[layer % colors.length]));
            }
            current_branches *= hf;  // Multiply by the branching factor for next layer
            distance_start += height;
            layer++;
        }
    }

    return result;
}
