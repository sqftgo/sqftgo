$ErrorActionPreference = "Continue"
Set-Location d:\sqftgo

function Login([string]$email, [string]$password) {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  return Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body $body
}

function Api([string]$method, [string]$path, $token, $bodyObj) {
  $headers = @{}
  if ($token) { $headers.Authorization = "Bearer $token" }
  $params = @{
    Uri = "http://localhost:3000$path"
    Method = $method
    Headers = $headers
    UseBasicParsing = $true
  }
  if ($null -ne $bodyObj) {
    $params.ContentType = "application/json"
    $params.Body = ($bodyObj | ConvertTo-Json -Depth 8 -Compress)
  }
  try {
    $resp = Invoke-WebRequest @params
    return @{ status = [int]$resp.StatusCode; body = $resp.Content }
  } catch {
    $code = 0
    $content = ""
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode.value__
      if (-not $code) { $code = [int]$_.Exception.Response.StatusCode }
      try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $content = $reader.ReadToEnd()
      } catch {
        $content = $_.ErrorDetails.Message
      }
    } else {
      $content = $_.Exception.Message
    }
    return @{ status = $code; body = $content }
  }
}

$results = New-Object System.Collections.Generic.List[object]
function Assert([string]$name, [bool]$ok, $detail) {
  $d = if ($null -eq $detail) { "" } else { [string]$detail }
  if ($d.Length -gt 180) { $d = $d.Substring(0, 180) }
  $results.Add([pscustomobject]@{ check = $name; pass = $ok; detail = $d }) | Out-Null
  Write-Output ("{0}  {1}  {2}" -f ($(if ($ok) { "PASS" } else { "FAIL" }), $name, $d))
}

$r = Api "GET" "/api/projects" $null $null
Assert "anon GET Active-only" ($r.status -eq 200) $r.body

$r = Api "POST" "/api/projects" $null @{
  title = "X"; description = "d"; city = "Udaipur"; locality = "City"; contactPhone = "9999999999"
}
Assert "anon POST 401" ($r.status -eq 401) $r.body

$r = Api "PATCH" "/api/projects/00000000-0000-0000-0000-000000000001" $null @{ title = "Hack" }
Assert "anon PATCH 401" ($r.status -eq 401) "$($r.status)"

$r = Api "DELETE" "/api/projects/00000000-0000-0000-0000-000000000001" $null $null
Assert "anon DELETE 401" ($r.status -eq 401) "$($r.status)"

$userLogin = Login "user@sqftgo.com" "user2026"
$brokerLogin = Login "broker@sqftgo.com" "broker2026"
$adminLogin = Login "admin@sqftgo.com" "admin2026"
$userTok = $userLogin.accessToken
$brokerTok = $brokerLogin.accessToken
$adminTok = $adminLogin.accessToken
$brokerId = $brokerLogin.id
$userId = $userLogin.id
Assert "login user" ([bool]$userTok) $userLogin.role
Assert "login broker" ([bool]$brokerTok) $brokerLogin.role
Assert "login admin" ([bool]$adminTok) $adminLogin.role

$r = Api "POST" "/api/projects" $userTok @{
  title = "User Project QA"; description = "should fail"; city = "Udaipur"
  locality = "Fateh Sagar"; contactPhone = "9000000001"; status = "Draft"
}
Assert "user POST 403" ($r.status -eq 403) $r.body

$r = Api "POST" "/api/projects" $brokerTok @{
  title = "Broker Active Attempt"; description = "should fail status"; city = "Udaipur"
  locality = "Fateh Sagar"; contactPhone = "9000000002"; status = "Active"
}
Assert "broker create Active 403" ($r.status -eq 403) $r.body

$r = Api "POST" "/api/projects" $brokerTok @{
  title = "Broker Featured Attempt"; description = "should fail featured"; city = "Udaipur"
  locality = "Fateh Sagar"; contactPhone = "9000000002"; status = "Draft"; featured = $true
}
Assert "broker create featured 403" ($r.status -eq 403) $r.body

$r = Api "POST" "/api/projects" $brokerTok @{
  title = "Pending No Images"; description = "needs image"; city = "Udaipur"
  locality = "Fateh Sagar"; contactPhone = "9000000002"; status = "Pending Review"
}
Assert "pending without images 400" ($r.status -eq 400) $r.body

$r = Api "POST" "/api/projects" $brokerTok @{
  title = "Bad Price Range"; description = "x"; city = "Udaipur"
  locality = "Fateh Sagar"; contactPhone = "9000000002"; status = "Draft"
  priceFrom = 100; priceTo = 50
}
Assert "priceTo < priceFrom 400" ($r.status -eq 400) $r.body

$r = Api "POST" "/api/projects" $brokerTok @{
  title = "Bad City Project"; description = "x"; city = "NotARealCityXYZ"
  locality = "Fateh Sagar"; contactPhone = "9000000002"; status = "Draft"
}
Assert "inactive city 400" ($r.status -eq 400) $r.body

$r = Api "POST" "/api/projects" $brokerTok @{
  title = "QA Draft Project Alpha"; description = "draft ok without images"; city = "Udaipur"
  locality = "Fateh Sagar"; contactPhone = "9000000002"; status = "Draft"
}
Assert "broker draft create 201" ($r.status -eq 201) $r.body
$draftId = ($r.body | ConvertFrom-Json).id

$img = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
$r = Api "POST" "/api/projects" $brokerTok @{
  title = "QA Pending Project Beta"; description = "pending with image"; city = "Udaipur"
  locality = "Hiran Magri"; contactPhone = "9000000002"; status = "Pending Review"
  images = @($img)
}
Assert "broker pending create 201" ($r.status -eq 201) $r.body
$pendingId = ($r.body | ConvertFrom-Json).id

$r = Api "GET" "/api/projects?mine=1&limit=50" $brokerTok $null
$mine = $r.body | ConvertFrom-Json
$onlyOwn = @($mine.items | Where-Object { $_.ownerId -ne $brokerId }).Count -eq 0
Assert "mine=1 only owner" (($r.status -eq 200) -and $onlyOwn -and ($mine.items.Count -ge 2)) "count=$($mine.items.Count) onlyOwn=$onlyOwn"

$r = Api "PATCH" "/api/projects/$draftId" $brokerTok @{ featured = $true }
Assert "broker patch featured 403" ($r.status -eq 403) $r.body

$r = Api "PATCH" "/api/projects/$draftId" $brokerTok @{ rejectionReason = "nope" }
Assert "broker patch rejectionReason 403" ($r.status -eq 403) $r.body

$r = Api "PATCH" "/api/projects/$draftId" $brokerTok @{ status = "Active" }
Assert "broker patch Active 403" ($r.status -eq 403) $r.body

$r = Api "PATCH" "/api/projects/$draftId" $brokerTok @{ title = "QA Draft Renamed"; ownerId = $userId }
$after = $r.body | ConvertFrom-Json
Assert "cannot reassign owner_id" (($r.status -eq 200) -and ($after.ownerId -eq $brokerId)) "owner=$($after.ownerId)"

$r = Api "PATCH" "/api/projects/$pendingId" $adminTok @{ status = "Active" }
Assert "admin approve Active" (($r.status -eq 200) -and (($r.body | ConvertFrom-Json).status -eq "Active")) $r.body

$r = Api "PATCH" "/api/projects/$pendingId" $adminTok @{ featured = $true }
Assert "admin feature" (($r.status -eq 200) -and (($r.body | ConvertFrom-Json).featured -eq $true)) $r.body

$r = Api "DELETE" "/api/projects/$pendingId" $brokerTok $null
Assert "broker DELETE Active 403" ($r.status -eq 403) $r.body

$r = Api "PATCH" "/api/projects/$draftId" $adminTok @{ status = "Rejected" }
Assert "admin reject without reason 400" ($r.status -eq 400) $r.body

$r = Api "PATCH" "/api/projects/$draftId" $adminTok @{ status = "Rejected"; rejectionReason = "Incomplete pricing and photos" }
Assert "admin reject with reason" (($r.status -eq 200) -and (($r.body | ConvertFrom-Json).status -eq "Rejected")) $r.body

$r = Api "GET" "/api/projects" $null $null
$pub = $r.body | ConvertFrom-Json
$allActive = @($pub.items | Where-Object { $_.status -ne "Active" }).Count -eq 0
$hasActive = @($pub.items | Where-Object { $_.id -eq $pendingId }).Count -eq 1
Assert "anon GET Active only + approved" (($r.status -eq 200) -and $allActive -and $hasActive) "total=$($pub.total) hasApproved=$hasActive"

$r = Api "PATCH" "/api/projects/$pendingId" $userTok @{ title = "Stolen Title" }
Assert "non-owner PATCH 403" ($r.status -eq 403) $r.body

$r = Api "PATCH" "/api/projects/$draftId" $brokerTok @{ status = "Pending Review"; images = @($img) }
Assert "broker resubmit after reject" (($r.status -eq 200) -and (($r.body | ConvertFrom-Json).status -eq "Pending Review")) $r.body

$r = Api "DELETE" "/api/projects/$draftId" $brokerTok $null
Assert "broker DELETE non-Active 200" ($r.status -eq 200) $r.body

$r = Api "DELETE" "/api/projects/$pendingId" $adminTok $null
Assert "admin DELETE Active 200" ($r.status -eq 200) $r.body

$fail = @($results | Where-Object { -not $_.pass }).Count
$pass = @($results | Where-Object { $_.pass }).Count
Write-Output "---- SUMMARY: $pass passed, $fail failed, $($results.Count) total ----"
$results | ConvertTo-Json -Depth 3 | Set-Content -Path "docs/PROJECTS_PHASE1_QA_RESULTS.json" -Encoding UTF8
if ($fail -gt 0) {
  $results | Where-Object { -not $_.pass } | Format-Table -AutoSize | Out-String | Write-Output
}
exit $fail
