export const DEFAULT_SUBJECTS = [
  { id: 'DSA',      name: 'Data Structures & Algorithms', icon: '🌳', desc: 'Arrays, Trees, Graphs, DP', weightage: 25 },
  { id: 'DBMS',     name: 'Database Management Systems',  icon: '🗄️', desc: 'SQL, Normalization, Transactions', weightage: 20 },
  { id: 'OS',       name: 'Operating Systems',            icon: '⚙️', desc: 'Scheduling, Memory, Deadlocks', weightage: 20 },
  { id: 'CN',       name: 'Computer Networks',            icon: '🌐', desc: 'OSI, TCP/IP, Protocols', weightage: 15 },
  { id: 'TOC',      name: 'Theory of Computation',        icon: '🔣', desc: 'Automata, Grammars, Turing', weightage: 10 },
  { id: 'Aptitude', name: 'Aptitude & Reasoning',         icon: '🧮', desc: 'Quant, Logical, Verbal', weightage: 10 },
];

export const DEFAULT_TOPICS = {
  DSA: [
    { id:'dsa1', name:'Arrays & Strings',       difficulty:'Easy',   importance:'High',   notesCount:0, hasTest:false },
    { id:'dsa2', name:'Linked Lists',            difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'dsa3', name:'Stacks & Queues',         difficulty:'Easy',   importance:'Medium', notesCount:0, hasTest:false },
    { id:'dsa4', name:'Trees & BST',             difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'dsa5', name:'Graphs & BFS/DFS',        difficulty:'Hard',   importance:'High',   notesCount:0, hasTest:false },
    { id:'dsa6', name:'Dynamic Programming',     difficulty:'Hard',   importance:'High',   notesCount:0, hasTest:false },
    { id:'dsa7', name:'Sorting Algorithms',      difficulty:'Easy',   importance:'Medium', notesCount:0, hasTest:false },
  ],
  DBMS: [
    { id:'db1', name:'ER Model & Design',        difficulty:'Easy',   importance:'Medium', notesCount:0, hasTest:false },
    { id:'db2', name:'SQL Queries',              difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'db3', name:'Normalization (1NF-BCNF)', difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'db4', name:'Transactions & ACID',      difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'db5', name:'Indexing & B-Trees',       difficulty:'Hard',   importance:'Medium', notesCount:0, hasTest:false },
    { id:'db6', name:'Concurrency Control',      difficulty:'Hard',   importance:'Medium', notesCount:0, hasTest:false },
  ],
  OS: [
    { id:'os1', name:'Process Management',       difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'os2', name:'CPU Scheduling',           difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'os3', name:'Memory Management',        difficulty:'Hard',   importance:'High',   notesCount:0, hasTest:false },
    { id:'os4', name:'Deadlocks',                difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'os5', name:'File Systems',             difficulty:'Easy',   importance:'Medium', notesCount:0, hasTest:false },
    { id:'os6', name:'Virtual Memory',           difficulty:'Hard',   importance:'Medium', notesCount:0, hasTest:false },
  ],
  CN: [
    { id:'cn1', name:'OSI & TCP/IP Models',      difficulty:'Easy',   importance:'High',   notesCount:0, hasTest:false },
    { id:'cn2', name:'Data Link Layer',          difficulty:'Medium', importance:'Medium', notesCount:0, hasTest:false },
    { id:'cn3', name:'Network Layer & IP',       difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'cn4', name:'Transport Layer',          difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'cn5', name:'Sliding Window Protocol',  difficulty:'Hard',   importance:'Medium', notesCount:0, hasTest:false },
  ],
  TOC: [
    { id:'toc1', name:'Finite Automata (DFA/NFA)', difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'toc2', name:'Regular Expressions',       difficulty:'Easy',   importance:'Medium', notesCount:0, hasTest:false },
    { id:'toc3', name:'Context Free Grammars',     difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'toc4', name:'Pushdown Automata',          difficulty:'Hard',   importance:'Medium', notesCount:0, hasTest:false },
    { id:'toc5', name:'Turing Machines',            difficulty:'Hard',   importance:'High',   notesCount:0, hasTest:false },
  ],
  Aptitude: [
    { id:'apt1', name:'Quantitative Aptitude', difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'apt2', name:'Logical Reasoning',     difficulty:'Medium', importance:'High',   notesCount:0, hasTest:false },
    { id:'apt3', name:'Verbal Ability',        difficulty:'Easy',   importance:'Medium', notesCount:0, hasTest:false },
    { id:'apt4', name:'Data Interpretation',   difficulty:'Hard',   importance:'Medium', notesCount:0, hasTest:false },
  ],
};

export const QUIZ_BANK = {
  DSA: [
    { id:1, q:"Worst-case time complexity of QuickSort?",      opts:["O(n log n)","O(n^2)","O(n)","O(log n)"],           ans:1, exp:"When pivot is always smallest or largest element." },
    { id:2, q:"Which data structure uses LIFO order?",         opts:["Queue","Stack","Heap","Tree"],                      ans:1, exp:"Stack = Last In First Out." },
    { id:3, q:"Height of a balanced BST with n nodes?",        opts:["O(n)","O(log n)","O(n^2)","O(1)"],                 ans:1, exp:"Balanced BST height is O(log n)." },
    { id:4, q:"Dijkstra algorithm is used for?",               opts:["Min spanning tree","Shortest path","Topological order","BFS"], ans:1, exp:"Single-source shortest path in weighted graph." },
    { id:5, q:"Dynamic Programming is based on?",              opts:["Greedy","Divide & Conquer","Optimal substructure","Backtracking"], ans:2, exp:"Overlapping subproblems + optimal substructure." },
  ],
  DBMS: [
    { id:1, q:"BCNF is stricter than which normal form?",       opts:["1NF","2NF","3NF","4NF"],                           ans:2, exp:"3NF allows transitive deps; BCNF does not." },
    { id:2, q:"Which SQL command removes a table completely?",  opts:["DELETE","REMOVE","DROP","TRUNCATE"],                ans:2, exp:"DROP removes table structure and all data." },
    { id:3, q:"A primary key constraint means?",               opts:["Can be NULL","Can duplicate","Both","Neither NULL nor Duplicate"], ans:3, exp:"PK = unique + not null." },
    { id:4, q:"ACID stands for?",                              opts:["Atomicity Consistency Isolation Durability","Availability Consistency Integrity Durability","Atomicity Concurrency Isolation Data","None"], ans:0, exp:"Core transaction properties." },
    { id:5, q:"B+ Tree is mainly used for?",                   opts:["Sorting","Indexing","Hashing","Encryption"],        ans:1, exp:"B+ Tree enables fast range queries for indexing." },
  ],
  OS: [
    { id:1, q:"Which scheduling algorithm can cause starvation?", opts:["FCFS","Round Robin","Priority Scheduling","SJF"], ans:2, exp:"Low-priority processes may never get CPU time." },
    { id:2, q:"Deadlock requires how many Coffman conditions?",   opts:["2","3","4","5"],                                  ans:2, exp:"Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait." },
    { id:3, q:"Virtual memory uses which combination?",           opts:["RAM only","Disk only","RAM + Disk","Cache only"], ans:2, exp:"Pages stored on disk, loaded to RAM on demand." },
    { id:4, q:"Semaphore is primarily used for?",                 opts:["Memory allocation","Synchronization","Scheduling","Paging"], ans:1, exp:"Controls access to shared resources between processes." },
    { id:5, q:"A page fault occurs when?",                        opts:["Page is in RAM","Page is not in RAM","Page is corrupted","RAM is full"], ans:1, exp:"Process accesses page not currently in physical memory." },
  ],
  CN: [
    { id:1, q:"TCP is described as?",                            opts:["Connectionless","Connection-oriented","Both","Neither"], ans:1, exp:"TCP establishes connection before data transfer." },
    { id:2, q:"IP addressing operates at which layer?",          opts:["Data Link","Network","Transport","Application"],   ans:1, exp:"Layer 3 = Network layer handles IP addressing." },
    { id:3, q:"Sliding window protocol is used for?",            opts:["Routing","Flow control","Error detection","Encryption"], ans:1, exp:"Manages data flow between sender and receiver." },
    { id:4, q:"DNS is responsible for?",                         opts:["IP to MAC","Domain to IP","IP to Domain","Domain to MAC"], ans:1, exp:"Domain Name System resolves hostnames to IP addresses." },
    { id:5, q:"Default port number for HTTP is?",                opts:["21","25","80","443"],                              ans:2, exp:"Port 80 for HTTP, 443 for HTTPS." },
  ],
  TOC: [
    { id:1, q:"DFA stands for?",                                 opts:["Dynamic Finite Automata","Deterministic Finite Automaton","Directed Formal Automata","None"], ans:1, exp:"Each state has exactly one transition per input symbol." },
    { id:2, q:"Regular languages are accepted by?",              opts:["PDA","TM","Finite Automata","LBA"],                ans:2, exp:"Finite Automata recognizes regular (Type 3) languages." },
    { id:3, q:"Context Free Languages are accepted by?",         opts:["DFA","NFA","PDA","TM"],                            ans:2, exp:"Pushdown Automata accepts Context Free Languages." },
    { id:4, q:"The Halting problem is?",                         opts:["Decidable","Undecidable","Semi-decidable","Regular"], ans:1, exp:"Cannot be decided by any Turing Machine." },
    { id:5, q:"An epsilon-NFA can be converted to?",             opts:["PDA","DFA","TM","Grammar"],                       ans:1, exp:"epsilon-NFA to NFA to DFA — all have equivalent power." },
  ],
  Aptitude: [
    { id:1, q:"If 2x+3y=12 and x-y=1, find x?",                 opts:["3","4","2","5"],                                  ans:0, exp:"x=3, y=2 satisfies both equations." },
    { id:2, q:"Train 100m long passes a pole in 10s. Speed?",    opts:["10 m/s","5 m/s","20 m/s","15 m/s"],              ans:0, exp:"Speed = 100/10 = 10 m/s." },
    { id:3, q:"Next number: 2, 6, 12, 20, 30, __?",              opts:["40","42","44","38"],                              ans:1, exp:"Differences: 4,6,8,10,12 — next = 30+12 = 42." },
    { id:4, q:"If A > B and B > C, then?",                       opts:["C > A","A > C","A = C","Cannot determine"],       ans:1, exp:"Transitive: A > B > C means A > C." },
    { id:5, q:"Simple Interest on Rs.5000 at 8% for 2 years?",   opts:["Rs.700","Rs.750","Rs.800","Rs.850"],              ans:2, exp:"SI = 5000 x 8 x 2 / 100 = Rs.800." },
  ],
};

export function initUserStudyData(email, subjectsMap, topicsMap) {
  const data = {};
  Object.keys(subjectsMap).forEach(sid => {
    const topics = (topicsMap[sid] || []).map(t => ({
      ...t, status: 'pending', studentNotes: ''
    }));
    data[sid] = {
      name:         subjectsMap[sid].name,
      icon:         subjectsMap[sid].icon,
      overallScore: 0,
      weakTopics:   [],
      miniTests:    [],
      topics,
    };
  });
  return data;
}
