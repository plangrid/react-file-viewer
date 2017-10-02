# Instructions for Logging Issues

## 1. Read the README

Please [read the README](https://github.com/plangrid/react-file-viewer/blob/master/README.md) before logging new issues, even if you think you have found a bug.

Issues that ask questions answered in the README will be closed without elaboration.

## 2. Search for Duplicates

[Search the existing issues](https://github.com/plangrid/react-file-viewer/issues) before logging a new one.

## 3. Did you find a bug?

When logging a bug, please be sure to include the following:
 * What version of library you're using
 * If at all possible, an *isolated* way to reproduce the behavior
 * The behavior you expect to see, and the actual behavior

## 4. Do you have a suggestion?

We also accept suggestions in the issue tracker.
Be sure to [check the README](https://github.com/plangrid/react-file-viewer/blob/master/README.md) first.

In general, things we find useful when reviewing suggestions are:
* A description of the problem you're trying to solve
* An overview of the suggested solution
* Examples of how the suggestion would work in various places
  * Code examples showing e.g. "this would be an error, this wouldn't"
* If relevant, precedent in other libraries can be useful for establishing context and expected behavior

# Instructions for Contributing Code

## Contributing bug fixes

React file viewer is currently accepting contributions in the form of bug fixes. A bug must have an issue tracking associated with it in [issues list](https://github.com/plangrid/react-file-viewer/issues). Your pull request should include a link to the bug that you are fixing. If you've submitted a PR for a bug, please post a comment in the bug to avoid duplication of effort.

## Contributing features

Features (things that add new or improved functionality) may be accepted, but will need to first be reviewed and approved by a [team member](https://github.com/plangrid/react-file-viewer/blob/master/AUTHORS.md). 

## Legal

You will need to complete a [Contributor License Agreement (CLA)](https://github.com/plangrid/react-file-viewer/blob/master/CLA.md). Briefly, this agreement testifies that you are granting us permission to use the submitted change according to the terms of the project's license, and that the work being submitted is under appropriate copyright.

Please submit a Contributor License Agreement (CLA) before submitting a pull request. Once we have received the signed CLA, we'll review the request. 

If you've signed the CLA agreement but our bot fails to recognize it, please make sure your commits are linked to your github email. For more information follow [these instructions](https://help.github.com/articles/why-are-my-commits-linked-to-the-wrong-user/#commits-are-not-linked-to-any-user)

## Housekeeping

Your pull request should: 

* Include a description of what your change intends to do
* Be a child commit of a reasonably recent commit in the **master** branch 
    * Requests need not be a single commit, but should be a linear sequence of commits (i.e. no merge commits in your PR)
* Make sure tests pass on the pull request
* Have clear commit messages 
    * e.g. "Refactor feature", "Fix issue", "Add tests for issue"
* Include adequate tests 
    * At least one test should fail in the absence of your non-test code changes. If your PR does not match this criteria, please specify why
    * Tests should include reasonable permutations of the target fix/change
    * Include baseline changes with your change
    * All changed code must have 100% code coverage
* Follow the code conventions in the code

