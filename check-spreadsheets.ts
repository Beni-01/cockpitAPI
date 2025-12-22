import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Replicating AutoDetectionService logic
const columnKeyMap: { [key: string]: string[] } = {
    project_name: [
        'project',
        'projet',
        'department',
        'département',
        'activity',
        'activité',
        'description',
        'titre',
        'new department'
    ],
    allocated_amount: [
        'amount',
        'montant',
        'budget',
        'allocated',
        'alloué',
        'total',
        'cout',
        'coût'
    ],
    external_id: [
        'id',
        'code',
        'reference',
        'ref',
        'external',
        'externe',
        'code département'
    ],
    cost_center: [
        'cost center',
        'centre de cout',
        'centre de coût',
        'tache',
        'tâche',
        'code tache'
    ],
    notes: [
        'note',
        'comment',
        'remarque',
        'description',
        'cash flow'
    ]
};

function getPotentialMapping(header: string): string | null {
    const cleanHeader = header.toLowerCase().trim();
    for (const [key, patterns] of Object.entries(columnKeyMap)) {
        if (patterns.some(p => cleanHeader.includes(p))) {
            return key;
        }
    }
    return null;
}

function analyzeFile(filePath: string) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Analyzing: ${fileName}`);

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assume first sheet
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of arrays
        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length === 0) {
            console.log('  ❌ Empty file');
            return;
        }

        // Try to find header row (first row with > 3 non-empty cells or specific keywords)
        let headerRowIndex = -1;
        let bestMatchCount = 0;
        let detectedMapping = {};

        // Scan first 10 rows
        for (let i = 0; i < Math.min(data.length, 10); i++) {
            const row = data[i];
            let matchCount = 0;
            const currentMapping = {};

            row.forEach((cell, idx) => {
                if (cell && typeof cell === 'string') {
                    const mappedKey = getPotentialMapping(cell);
                    if (mappedKey) {
                        matchCount++;
                        currentMapping[cell] = mappedKey;
                    }
                }
            });

            if (matchCount > bestMatchCount) {
                bestMatchCount = matchCount;
                headerRowIndex = i;
                detectedMapping = currentMapping;
            }
        }

        if (headerRowIndex === -1) {
            console.log('  ⚠️ Could not confirm header row (no familiar columns found)');
        } else {
            console.log(`  ✅ Header found at Row ${headerRowIndex + 1}`);
            console.log(`  Mapped Columns:`);
            let hasProject = false;
            let hasAmount = false;

            for (const [header, field] of Object.entries(detectedMapping)) {
                console.log(`    - "${header}" -> ${field}`);
                if (field === 'project_name') hasProject = true;
                if (field === 'allocated_amount') hasAmount = true;
            }

            if (hasProject && hasAmount) {
                console.log('  🟢 COMPATIBLE: Found Project/Department and Amount columns.');
            } else {
                console.log('  🟡 PARTIAL: Missing critical columns (Project or Amount). Check mapping.');
            }
        }

    } catch (error) {
        console.error(`  ❌ Error reading file: ${error.message}`);
    }
}

async function checkAll() {
    const folders = ['Budget_Département', 'Master_Budget'];
    const baseDir = '/Users/akash/Downloads/360App';

    for (const folder of folders) {
        const dirPath = path.join(baseDir, folder);
        console.log(`\n================================`);
        console.log(`📂 Checking Folder: ${folder}`);
        console.log(`================================`);

        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.xlsx'));
            for (const file of files) {
                analyzeFile(path.join(dirPath, file));
            }
        } else {
            console.log('Folder not found');
        }
    }
}

checkAll();
