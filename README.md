# rustyByte

A prototype for a Capture the Flag platform.

---

## Contributing

### Initial Setup (One Time)

1. **Clone the repository**
   ```bash
   git clone https://github.com/corey/rustyByte.git
   cd rustyByte
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment**
   - Change `.env.example` to `.env` (ask me for the values)
   - Run `npx prisma generate` to generate the Prisma client

4. **Install recommended VS Code extensions**
   - When you open the project, VS Code will prompt you to install recommended extensions
   - Click "Install All" to get Prettier, ESLint, Prisma, and Tailwind CSS support

---

### Code Formatting (Prettier)

This project uses **Prettier** for automatic code formatting. This ensures all our code looks consistent regardless of who wrote it.

**How it works:**
- When you save a file, it automatically formats (via `.vscode/settings.json`)
- The formatting rules are defined in `.prettierrc`
- These settings only apply to this project — your personal VS Code settings for other projects are not affected

**Manual formatting:**
```bash
npm run format        # Format all files
npm run format:check  # Check if files are formatted (doesn't change them)
```

**What Prettier handles:**
- Semicolons, quotes, indentation
- Line length (wraps at 100 characters)
- Trailing commas
- Consistent spacing

You don't need to think about formatting — just write code and save!

---

### Making Changes

#### Before You Start Working

**Always pull the latest changes first:**
```bash
git checkout main
git pull origin main
```

This ensures you're working with the most up-to-date code.

#### Creating a Feature Branch

Never work directly on `main`. Create a branch for your changes:

```bash
git checkout -b your-feature-name
```

Use descriptive branch names like:
- `add-leaderboard`
- `fix-login-bug`
- `update-challenge-ui`

#### Making Commits

1. **Stage your changes**
   ```bash
   git add .
   ```
   Or stage specific files:
   ```bash
   git add path/to/file.tsx
   ```

2. **Commit with a clear message**
   ```bash
   git commit -m "Add leaderboard component"
   ```

### When you are finished working on your feature:

**push your local branch, go to github and create a pull request to ask your changes to be pulled into main branch:**

```bash
git push origin your-feature-name
```

---

#### Creating a Pull Request

1. Go to the repository on GitHub
2. You'll see a prompt to create a Pull Request for your recently pushed branch
3. Click "Compare & pull request"
4. Write a brief description of what you changed and why
5. Click "Create pull request"

I'll review and merge it when ready, or ask you to make futher changes.

---

### Keeping Your Code in Sync

#### Updating Your Branch with Latest Main

If `main` has been updated while you're working on a feature:

```bash
# Make sure your changes are committed first
git add .
git commit -m "Your work in progress"

# Fetch and merge latest main into your branch
git fetch origin
git merge origin/main
```

#### After Your PR is Merged

```bash
git checkout main
git pull origin main
git branch -d your-feature-name  # Delete your old branch
```


### If there are changes to main that you want to have while you're still working on your features:

**while still in your working directory:**
git fetch origin 
git log origin/main --oneline -5

#### After fetching, you can:
**See the diff between your branch and remote main**
git diff feature-a origin/main

**If you want those changes in your working branch:**
git merge origin/main

**Or if you want to update your local main (switch first):**
git checkout main
git merge origin/main    # Now local main matches remote
git checkout feature-a   # Go back to your branch


---

### Preventing Conflicts

1. **Pull frequently** - Start each session with `git pull origin main`
2. **Keep branches short-lived** - Smaller, focused changes are easier to merge
3. **Communicate** - Let others know what files/features you're working on
4. **Don't edit the same files simultaneously** - Coordinate if you need to

---

### Resolving Conflicts

If you get a merge conflict:

1. **Git will tell you which files have conflicts**
   ```
   CONFLICT (content): Merge conflict in app/page.tsx
   ```

2. **Open the conflicted file** - You'll see markers like:
   ```
   <<<<<<< HEAD
   your changes
   =======
   others' changes
   >>>>>>> origin/main
   ```

3. **Edit the file** - Keep the code you want, remove the markers

4. **Stage and commit the resolution**
   ```bash
   git add .
   git commit -m "Resolve merge conflict in app/page.tsx"
   ```

5. **Push your branch**
   ```bash
   git push origin your-feature-name
   ```

If you're stuck, reach out and I can help.

---

## Installing Node.js & npm

If you don't have Node.js installed, here's how to get it:

### Mac

**Option 1: Direct Download (Easiest)**
1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS (Long Term Support) version
3. Run the installer

**Option 2: Using Homebrew**
```bash
# Install Homebrew first if you don't have it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js:
brew install node
```

### Windows

**Option 1: Direct Download (Easiest)**
1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS (Long Term Support) version
3. Run the installer (keep all default options)

**Option 2: Using winget (Windows 11 / Windows 10)**
```powershell
winget install OpenJS.NodeJS.LTS
```

### Verify Installation

After installing, open a new terminal and run:
```bash
node --version
npm --version
```

You should see version numbers for both. If you see errors, try closing and reopening your terminal.

### Git Quick Reference

| Task | Command |
|------|---------|
| Pull latest | `git pull origin main` |
| Create branch | `git checkout -b branch-name` |
| Stage changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push branch | `git push origin branch-name` |
| Switch to main | `git checkout main` |
| Delete branch | `git branch -d branch-name` |
| See status | `git status` |
| See branches | `git branch` |

---
