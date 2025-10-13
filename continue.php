<?php
require_once 'config/db.php';

// Get token from URL
$token = isset($_GET['token']) ? $_GET['token'] : '';
if (empty($token)) {
    die("Invalid or missing token");
}

// Fetch saved data
$stmt = $conn->prepare("SELECT * FROM form_submissions WHERE token = ? AND expires_at > NOW() AND completed = 0");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("This link has expired or is invalid");
}

$data = $result->fetch_assoc();

// Include header
include 'header.php';
?>

<div class="container mx-auto bg-[#566c7a] py-10">
    <div class="bg-white rounded-lg p-4 mb-10 shadow max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold mb-6">Confirm Your Details</h2>
        
        <div class="mb-6">
            <h3 class="text-xl font-semibold mb-4">Your Information</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="font-semibold">Name:</p>
                    <p><?php echo htmlspecialchars($data['title'] . ' ' . $data['firstname'] . ' ' . $data['lastname']); ?></p>
                </div>
                <div>
                    <p class="font-semibold">Email:</p>
                    <p><?php echo htmlspecialchars($data['email']); ?></p>
                </div>
                <div>
                    <p class="font-semibold">Phone:</p>
                    <p><?php echo htmlspecialchars($data['phone']); ?></p>
                </div>
                <div>
                    <p class="font-semibold">Address:</p>
                    <p><?php echo htmlspecialchars($data['address']); ?></p>
                </div>
            </div>
        </div>

        <form id="finalStepForm" class="space-y-6">
            <input type="hidden" id="submissionToken" value="<?php echo htmlspecialchars($token); ?>">
            
            <div>
                <label class="block text-sm font-medium text-gray-700">
                    <input type="checkbox" id="confirmDetails" class="mr-2">
                    I confirm that all the above details are correct
                </label>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700">
                    <input type="checkbox" id="termsAccepted" class="mr-2">
                    I accept the terms and conditions
                </label>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Signature:</label>
                <canvas id="signature-pad" class="border border-gray-300 rounded-md w-full" height="200"></canvas>
                <button type="button" class="mt-2 text-sm text-gray-500" data-action="click->new-form#clearSignature">Clear Signature</button>
                <input type="hidden" id="signatureData" name="signature">
            </div>

            <div class="text-right">
                <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    Complete Submission
                </button>
            </div>
        </form>
    </div>
</div>

<script>
// Initialize signature pad
const canvas = document.getElementById('signature-pad');
const signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)'
});

// Handle form submission
document.getElementById('finalStepForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!document.getElementById('confirmDetails').checked) {
        alert('Please confirm your details');
        return;
    }

    if (!document.getElementById('termsAccepted').checked) {
        alert('Please accept the terms and conditions');
        return;
    }

    if (signaturePad.isEmpty()) {
        alert('Please provide your signature');
        return;
    }

    const signatureData = signaturePad.toDataURL();
    const token = document.getElementById('submissionToken').value;

    try {
        const response = await fetch('complete-submission.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                signature: signatureData,
                termsAccepted: true
            })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = 'thankyou.html';
        } else {
            alert(result.error || 'An error occurred');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
</script>

<?php
include 'footer.php';
?>